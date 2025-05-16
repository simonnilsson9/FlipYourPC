import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    fetchInventory,
    deleteComponent,
    saveComponent
} from "../services/API";
import ComponentTypeEnum, { ComponentTypeTranslations } from "../Components/ComponentTypeEnum";
import ConfirmDeleteModal from "../Components/ConfirmDeleteModal";
import Alert from '../Components/Alert';
import { ChevronDownIcon, PencilSquareIcon, TrashIcon, CreditCardIcon } from '@heroicons/react/24/solid';


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
    const [alert, setAlert] = useState(null);
    const [validationError, setValidationError] = useState("");
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
                    (acc, c) => acc + c.price,
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
            store:"",
            type: ""
        });
        setShowModal(true);
    };

    const handleEditComponent = (component) => {
        setCurrentComponent(component);
        setShowModal(true);
    };

    const handleDeleteComponent = async (id) => {
        try {
            await deleteComponent(id);
            loadInventory();
            setAlert({ type: "default", title: "Borttagen", message: "Komponenten har raderats." });
        } catch (error) {
            setAlert({ type: "error", title: "Fel", message: "Kunde inte ta bort komponenten." });
        }
    };

    const [modalError, setModalError] = useState("");

    const handleSave = async () => {
        const { name, price, manufacturer, type } = currentComponent;

        // Frontend validering för "Typ av komponent"
        if (!type) {
            setModalError("Du måste välja en typ av komponent.");
            return;
        }

        // Rensa ev. tidigare fel
        setModalError("");

        try {
            const result = await saveComponent({
                ...currentComponent,
                price: parseInt(price),
            });

            if (!result.success) {
                if (result.status === 400 && result.data.errors) {
                    const firstError = Object.values(result.data.errors)[0][0];
                    setModalError(firstError);
                } else {
                    setModalError("Kunde inte spara komponenten.");
                }
                return;
            }

            // Success!
            setModalError("");
            setShowModal(false);
            loadInventory();
            setAlert({ type: "default", title: "Sparad", message: "Komponenten har sparats." });
        } catch (error) {
            setModalError("Något gick fel vid sparning.");
        }
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

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">  
            <div className="max-w-5xl mx-auto text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    Lager
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Här kan du hantera alla komponenter i ditt lager.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-center w-10 h-10 text-gray-600 dark:text-gray-300">
                        <CreditCardIcon className="w-6 h-6" />
                    </div>
                    <div className="ml-3">
                        <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Totalt lagervärde</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{totalValue.toLocaleString()} kr</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Sök komponent..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                    />
                    <button
                        onClick={handleAddComponent}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                        + Lägg till komponent
                    </button>
                </div>
            </div>


            {components.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400 italic">
                    Inga komponenter att visa.
                </div>
            ) : (
                Object.entries(groupedComponents).map(([type, comps]) => (
                    <div key={type} className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md mb-4 overflow-hidden">
                        <button
                            className="w-full flex justify-between items-center p-4 text-left text-gray-800 dark:text-white font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                            onClick={() => toggleSection(type)}
                        >
                            <span>{ComponentTypeTranslations[type] || type}</span>
                            <ChevronDownIcon
                                className={`w-5 h-5 text-gray-500 dark:text-gray-300 transform transition-transform duration-300 ${openSections.includes(type) ? 'rotate-180' : 'rotate-0'}`}
                            />
                        </button>

                        <div className={`px-4 overflow-hidden transition-all duration-500 ease-in-out ${openSections.includes(type) ? 'max-h-[1000px] pb-4' : 'max-h-0'}`}>
                            {openSections.includes(type) && (
                                <table className="w-full text-sm text-left mt-2 table-fixed">
                                    <thead>
                                        <tr className="border-b border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                                            <th className="py-2 w-1/4">Namn</th>
                                            <th className="w-1/5">Tillverkare</th>
                                            <th className="w-1/5">Värde</th>
                                            <th className="w-1/5">Butik</th>
                                            <th className="w-1/20">Åtgärder</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comps.map((comp) => (
                                            <tr key={comp.id} className="text-gray-800 dark:text-gray-200">
                                                <td className="py-2">{comp.name}</td>
                                                <td>{comp.manufacturer}</td>
                                                <td>{comp.price} kr</td>
                                                <td>{comp.store || "-"}</td>
                                                <td className="space-x-2">
                                                    <button
                                                        onClick={() => handleEditComponent(comp)}
                                                        className="text-white-500 hover:text-gray-500 cursor-pointer"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5 inline" />
                                                    </button>
                                                    <button
                                                        onClick={() => requestDelete(comp.id)}
                                                        className="text-red-500 hover:text-red-700 cursor-pointer"
                                                    >
                                                        <TrashIcon className="w-5 h-5 inline" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                ))
            )}


            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            {currentComponent?.id ? "Redigera komponent" : "Lägg till komponent"}
                        </h2>
                        {modalError &&(
                            <div className="mb-4 text-sm text-red-600 dark:text-red-400">
                                {modalError}
                            </div>
                        )}

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
                                    <option key={type} value={type}>
                                        {ComponentTypeTranslations[type] || type}
                                    </option>
                                ))}
                            </select>
                        </div>

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

                        {/* Butik */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Butik</label>
                            <input
                                type="text"
                                value={currentComponent?.store || ""}
                                onChange={(e) => setCurrentComponent({ ...currentComponent, store: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
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
            {alert && (
                <Alert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}            
        </div>
    );
};

export default InventoryPage;
