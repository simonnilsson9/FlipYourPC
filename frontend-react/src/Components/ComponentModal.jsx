import React from "react";
import ComponentTypeEnum, { ComponentTypeTranslations } from "./ComponentTypeEnum";

const ComponentModal = ({ isOpen, component, setComponent, onSave, onCancel, modalError }) => {
    if (!isOpen || !component) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {component?.id ? "Redigera komponent" : "Lägg till komponent"}
                </h2>
                {modalError && (
                    <div className="mb-4 text-sm text-red-600 dark:text-red-400">
                        {modalError}
                    </div>
                )}

                {/* Typ */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Typ av komponent</label>
                    <select
                        value={component?.type || ""}
                        onChange={(e) => setComponent({ ...component, type: e.target.value })}
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

                {/* Skick */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Skick</label>
                    <select
                        value={component?.condition || "New"}
                        onChange={(e) => setComponent({ ...component, condition: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                        <option value="New">Ny</option>
                        <option value="Used">Begagnad</option>
                    </select>
                </div>

                {/* Namn */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Namn</label>
                    <input
                        type="text"
                        value={component?.name || ""}
                        onChange={(e) => setComponent({ ...component, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                </div>

                {/* Tillverkare */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tillverkare</label>
                    <input
                        type="text"
                        value={component?.manufacturer || ""}
                        onChange={(e) => setComponent({ ...component, manufacturer: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                </div>

                {/* Pris */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Pris (kr)</label>
                    <input
                        type="number"
                        value={component?.price || ""}
                        onChange={(e) => setComponent({ ...component, price: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                </div>

                {/* Butik */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Butik</label>
                    <input
                        type="text"
                        value={component?.store || ""}
                        onChange={(e) => setComponent({ ...component, store: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-700 rounded text-white">
                        Avbryt
                    </button>
                    <button onClick={onSave} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded">
                        Spara
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComponentModal;