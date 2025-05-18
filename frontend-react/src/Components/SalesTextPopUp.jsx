import React from "react";

const SalesTextPopup = ({ pc, onClose }) => {
    if (!pc || !pc.components) return null;

    const conditionLabel = (cond) => cond === "New" ? "(NY)" : "(Begagnad)";

    const getComponentName = (type) => {
        const match = pc.components.find(c => c.type === type);
        return match ? match.name : "";
    };

    const orderedTypes = [
        "Case",
        "Motherboard",
        "CPU",
        "GPU",
        "RAM",
        "SSD",
        "CPUCooler",
        "PSU",
        "Other"
    ];

    const typeLabels = {
        Case: "Chassi",
        Motherboard: "Moderkort",
        CPU: "Processor",
        GPU: "Grafikkort",
        RAM: "Ram",
        SSD: "Hårddisk",
        CPUCooler: "Processorkylare",
        PSU: "Nätaggregat",
        Other: "Övrigt"
    };

    const specsList = orderedTypes.map((type) => {
        const match = pc.components.find(c => c.type === type);
        if (!match) return null;
        return `${typeLabels[type]}: ${match.name} ${conditionLabel(match.condition)}`;
    }).filter(Boolean);

    const title = `Gamingdator | ${getComponentName("GPU")} | ${getComponentName("CPU")} | ${getComponentName("RAM")}`;

    const bodyText = [
        "Datorn fungerar att spela i alla nya spel och presterar bäst i 1080/1440p. Komponenterna är en blandning av nya och begagnade delar, där jag har restaurerat det begagnade för att det ska prestera så bra som möjligt.",
        "",
        "Datorn kommer också med Windows 11 och drivrutiner installerade.",
        "",
        "Specs:",
        "",
        ...specsList,
        "",
        "Vid frågor är det bara att skriva!",
        "Mvh Simon"
    ].join("\n");

    const copyToClipboard = async (text, label) => {
        try {
            await navigator.clipboard.writeText(text);
            alert(`${label} kopierad!`);
        } catch {
            alert("Kunde inte kopiera.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Försäljningstext</h2>

                {/* Rubrik */}
                <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rubrik</label>
                    <div className="flex items-start gap-2 mt-1">
                        <pre className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                            {title}
                        </pre>
                        <button
                            onClick={() => copyToClipboard(title, "Rubrik")}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded h-fit"
                        >
                            Kopiera
                        </button>
                    </div>
                </div>

                {/* Text */}
                <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Text</label>
                    <div className="flex items-start gap-2 mt-1">
                        <pre className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm text-gray-900 dark:text-white whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                            {bodyText}
                        </pre>
                        <button
                            onClick={() => copyToClipboard(bodyText, "Text")}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded h-fit"
                        >
                            Kopiera
                        </button>
                    </div>
                </div>

                {/* Kopiera båda */}
                <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={() => copyToClipboard(`${title}\n\n${bodyText}`, "Rubrik och text")}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                        Kopiera allt
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
                    >
                        Stäng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesTextPopup;