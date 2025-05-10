import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    fetchInventory,
    deleteComponent,
    saveComponent
} from "../services/API";
import ComponentTypeEnum from "../Components/ComponentTypeEnum";
import ConfirmDeleteModal from "../Components/ConfirmDeleteModal";

const InventoryPage = () => {
    const [components, setComponents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentComponent, setCurrentComponent] = useState(null);
    const [totalValue, setTotalValue] = useState(0);
    const [infoMessage, setInfoMessage] = useState("");
    const [openSections, setOpenSections] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [componentToDelete, setComponentToDelete] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        if (token) loadInventory();
    }, []);

    const requestDelete = (componentId) => {
        setComponentToDelete(componentId);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        if (!componentToDelete) return;
        await handleDeleteComponent(componentToDelete);
        setShowConfirm(false);
        setComponentToDelete(null);
    };

    const loadInventory = async () => {
        try {
            const data = await fetchInventory();
            if (!data || data.statusCode === "Unauthorized") {
                setInfoMessage("Du måste vara inloggad för att se ditt lager.");
                return;
            }

            if (data.components?.length === 0) {
                setInfoMessage("Ditt lager är tomt. Lägg till en komponent!");
            } else {
                setComponents(data.components);
                const value = data.components.reduce(
                    (acc, c) => acc + c.price * c.totalStock,
                    0
                );
                setTotalValue(value);
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
            setInfoMessage("Ett fel uppstod vid hämtning av lagret.");
        }
    };

    const handleAddComponent = () => {
        setCurrentComponent({
            name: "",
            price: 0,
            manufacturer: "",
            totalStock: 1,
            type: ""
        });
        setShowModal(true);
    };

    const handleEditComponent = (component) => {
        setCurrentComponent(component);
        setShowModal(true);
    };

    const handleDeleteComponent = async (id) => {
        await deleteComponent(id);
        loadInventory();
    };

    const handleSave = async () => {
        const { name, price, manufacturer, totalStock, type } = currentComponent;
        if (!name || !price || !manufacturer || !totalStock || !type) {
            alert("Fyll i alla fält");
            return;
        }

        await saveComponent({
            ...currentComponent,
            price: parseInt(price),
            totalStock: parseInt(totalStock),
        });

        setShowModal(false);
        loadInventory();
    };

    const groupedComponents = components.reduce((acc, component) => {
        acc[component.type] = acc[component.type] || [];
        acc[component.type].push(component);
        return acc;
    }, {});

    const toggleSection = (type) => {
        setOpenSections((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    };

    if (!token) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-700 dark:text-white mb-2">
                    Du måste vara inloggad för att se lagret.
                </p>
                <Link to="/login" className="text-blue-600 hover:underline">
                    Gå till inloggning
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lager</h1>
                <button
                    onClick={handleAddComponent}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Lägg till komponent
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="text-lg font-medium text-purple-600 dark:text-purple-400">
                    Totalt lagervärde: {totalValue.toLocaleString()} kr
                </div>
                <input
                    type="text"
                    placeholder="Sök komponent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                />
            </div>

            {Object.entries(groupedComponents).map(([type, comps]) => (
                <div key={type} className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md mb-4 overflow-hidden">
                    <button
                        className="w-full flex justify-between items-center p-4 text-left text-gray-800 dark:text-white font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        onClick={() => toggleSection(type)}
                    >
                        <span>{type}</span>
                        <span
                            className={`transform transition-transform duration-300 ${openSections.includes(type) ? 'rotate-180' : ''}`}
                        >
                            ▼
                        </span>
                    </button>

                    <div
                        className={`px-4 overflow-hidden transition-all duration-500 ease-in-out ${openSections.includes(type) ? 'max-h-[1000px] pb-4' : 'max-h-0'
                            }`}
                    >
                        {openSections.includes(type) && (
                            <table className="w-full text-sm text-left mt-2">
                                <thead>
                                    <tr className="border-b border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                                        <th className="py-2">Namn</th>
                                        <th>Tillverkare</th>
                                        <th>Antal</th>
                                        <th>Värde/st</th>
                                        <th>Totalvärde</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comps.map((comp) => (
                                        <tr key={comp.id} className="text-gray-800 dark:text-gray-200">
                                            <td className="py-2">{comp.name}</td>
                                            <td>{comp.manufacturer}</td>
                                            <td>{comp.totalStock}</td>
                                            <td>{comp.price} kr</td>
                                            <td>{comp.price * comp.totalStock} kr</td>
                                            <td className="space-x-2">
                                                <button
                                                    onClick={() => handleEditComponent(comp)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    ✎
                                                </button>
                                                <button onClick={() => requestDelete(comp.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ))}


            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            {currentComponent?.id ? "Redigera komponent" : "Lägg till komponent"}
                        </h2>

                        {/* Namn */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Namn</label>
                            <input
                                type="text"
                                value={currentComponent?.name || ""}
                                onChange={(e) => setCurrentComponent({ ...currentComponent, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Tillverkare */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tillverkare</label>
                            <input
                                type="text"
                                value={currentComponent?.manufacturer || ""}
                                onChange={(e) => setCurrentComponent({ ...currentComponent, manufacturer: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Pris */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Pris (kr)</label>
                            <input
                                type="number"
                                value={currentComponent?.price || ""}
                                onChange={(e) => setCurrentComponent({ ...currentComponent, price: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Antal */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Antal i lager</label>
                            <input
                                type="number"
                                value={currentComponent?.totalStock || ""}
                                onChange={(e) => setCurrentComponent({ ...currentComponent, totalStock: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Typ */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Typ av komponent</label>
                            <select
                                value={currentComponent?.type || ""}
                                onChange={(e) => setCurrentComponent({ ...currentComponent, type: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            >
                                <option value="">Välj typ</option>
                                {Object.values(ComponentTypeEnum).map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Actionknappar */}
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-700 rounded dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Spara
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmDeleteModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default InventoryPage;
