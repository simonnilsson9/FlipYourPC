import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    fetchInventory,
    deleteComponent,
    saveComponent,
} from "../services/API";
import ComponentTypeEnum, { ComponentTypeTranslations } from "../Components/ComponentTypeEnum";
import ConfirmDeleteModal from "../Components/ConfirmDeleteModal";
import Alert from '../Components/Alert';
import ComponentModal from "../Components/ComponentModal";
import ExportInventory from "../Export/ExportInventory";
import { ChevronDownIcon, PencilSquareIcon, TrashIcon, CreditCardIcon, PlusIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';


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

    const handleDuplicateComponent = async (component) => {
        try {
            const newComponent = { ...component };
            delete newComponent.id; // ta bort id så det genereras nytt
            const result = await saveComponent(newComponent);
            if (result.success) {
                loadInventory();
                setAlert({ type: "default", title: "Duplicerad", message: "Komponenten har duplicerats." });
            } else {
                setAlert({ type: "error", title: "Fel", message: "Kunde inte duplicera komponenten." });
            }
        } catch (err) {
            setAlert({ type: "error", title: "Fel", message: "Ett fel uppstod vid duplicering." });
        }
    }

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
            type: "",
            condition: "New",
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
                    <button
                        onClick={handleAddComponent}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg text-sm cursor-pointer"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Lägg till komponent
                    </button>
                    <ExportInventory />
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
                                <table className="w-full table-fixed text-sm text-left mt-2">
                                    <thead>
                                        <tr className="border-b border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                            <th className="w-[25%] px-2 py-2">Namn</th>
                                            <th className="w-[15%] px-2 py-2 hidden sm:table-cell">Tillverkare</th>
                                            <th className="w-[15%] px-2 py-2">Värde</th>
                                            <th className="w-[15%] px-2 py-2 hidden sm:table-cell">Butik</th>
                                            <th className="w-[15%] px-2 py-2">Skick</th>
                                            <th className="w-[15%] px-2 py-2 pr-4 text-right">Åtgärder</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comps.map((comp) => (
                                            <tr key={comp.id} className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                                                <td className="px-2 py-2 truncate">{comp.name}</td>
                                                <td className="px-2 py-2 hidden sm:table-cell">{comp.manufacturer}</td>
                                                <td className="px-2 py-2">{comp.price} kr</td>
                                                <td className="px-2 py-2 hidden sm:table-cell">{comp.store || "-"}</td>
                                                <td className="px-2 py-2">{comp.condition === "Used" ? "Begagnad" : "Ny"}</td>
                                                <td className="px-2 py-2">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleEditComponent(comp)} className="text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-300" title="Redigera">
                                                            <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        </button>
                                                        <button onClick={() => handleDuplicateComponent(comp)} className="text-blue-500 hover:text-blue-700" title="Duplicera">
                                                            <DocumentDuplicateIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        </button>
                                                        <button onClick={() => requestDelete(comp.id)} className="text-red-500 hover:text-red-700" title="Radera">
                                                            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        </button>
                                                    </div>
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
            <ComponentModal
                isOpen={showModal}
                component={currentComponent}
                setComponent={setCurrentComponent}
                onSave={handleSave}
                onCancel={() => setShowModal(false)}
                modalError={modalError}
            />
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
