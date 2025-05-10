import React from "react";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, message = "Är du säker på att du vill radera detta?" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-sm p-6 text-center">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{message}</h2>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                    >
                        Avbryt
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                        Radera
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
