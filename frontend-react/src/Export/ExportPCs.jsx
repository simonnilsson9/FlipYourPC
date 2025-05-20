import React, { useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { exportPCs } from "../services/API";
import Alert from "../Components/Alert";

const ExportPCs = () => {
    const [showModal, setShowModal] = useState(false);
    const [statuses, setStatuses] = useState({
        Planning: true,
        ForSale: true,
        Sold: true
    });
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [alert, setAlert] = useState(null);

    const handleExport = async () => {
        const queryParams = new URLSearchParams();

        if (fromDate) queryParams.append("fromDate", fromDate);
        if (toDate) queryParams.append("toDate", toDate);

        // Här byggs en enda kommaseparerad lista med valda statusar
        const selectedStatuses = Object.keys(statuses).filter(status => statuses[status]);
        if (selectedStatuses.length > 0) {
            queryParams.append("statuses", selectedStatuses.join(","));
        }

        try {
            const blob = await exportPCs(queryParams.toString());
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "pcs-export.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setAlert({
                type: "default",
                title: "Export klar",
                message: "Filen har laddats ner."
            });
        } catch (err) {
            setAlert({
                type: "error",
                title: "Fel",
                message: err.message || "Något gick fel vid export."
            });
        }

        setShowModal(false);
    };

    const toggleStatus = (key) => {
        setStatuses(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <>
            {alert && (
                <Alert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm cursor-pointer"
            >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Exportera PCs
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-40">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Exportinställningar</h2>

                        <div className="mb-4">
                            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">Från datum</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">Till datum</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Inkludera status:</p>
                            {Object.keys(statuses).map((status) => (
                                <label key={status} className="block text-sm text-gray-600 dark:text-gray-200">
                                    <input
                                        type="checkbox"
                                        checked={statuses[status]}
                                        onChange={() => toggleStatus(status)}
                                        className="mr-2"
                                    />
                                    {status === "Planning" ? "Planering" : status === "ForSale" ? "Till salu" : "Såld"}
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Exportera
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExportPCs;