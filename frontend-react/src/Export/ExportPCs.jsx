import React from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { exportPCs } from "../services/API";

const ExportPCs = () => {
    const handleExport = async () => {
        try {
            const blob = await exportPCs();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "pcs-export.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Ett fel uppstod vid export: " + err.message);
        }
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm"
        >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exportera PCs
        </button>
    );
};

export default ExportPCs;