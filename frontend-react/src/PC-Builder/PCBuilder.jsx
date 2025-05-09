import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../Components/Alert";
import ImageUploader from "../Components/ImageUploader";
import {
    getAllPCs,
    createPC,
    addComponentsToPC,
    deletePC,
    updatePC,
    fetchInventory,
    removeComponentFromPC,
} from "../services/API";

const PCBuilder = () => {
    const [pcs, setPcs] = useState([]);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [activeTab, setActiveTab] = useState("ongoing");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCompListModal, setShowCompListModal] = useState(false);
    const [showAddCompModal, setShowAddCompModal] = useState(false);

    const [currentPC, setCurrentPC] = useState(null);
    const [currentComponents, setCurrentComponents] = useState([]);

    const [pcName, setPcName] = useState("");
    const [pcDescription, setPcDescription] = useState("");
    const [pcPrice, setPcPrice] = useState("");
    const [pcImageURL, setPcImageURL] = useState("");

    const [alert, setAlert] = useState(null); // typ { type, title, message }
    const navigate = useNavigate();

    useEffect(() => {
        fetchPCs();
        fetchComponents();
    }, []);

    const fetchPCs = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        try {
            const all = await getAllPCs(token);
            setPcs(all || []);
        } catch (err) {
            console.error("Error fetching PCs:", err);
            showAlert("error", "Fel", "Kunde inte hämta dina PC's");
        }
    };

    const fetchComponents = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        try {
            const inv = await fetchInventory(token);
            setAvailableComponents(inv.components || []);
        } catch (err) {
            console.error("Error fetching components:", err);
            showAlert("error", "Fel", "Kunde inte ladda dina komponenter");
        }
    };

    const handleCreatePC = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token || !pcName) return;
        try {
            await createPC({ name: pcName }, token);
            setShowCreateModal(false);
            setPcName("");
            fetchPCs();
            showAlert("success", "Skapad", "Din PC har skapats.");
        } catch (err) {
            console.error("Error creating PC:", err);
            showAlert("error", "Fel", "Kunde inte skapa bygget.");
        }
    };

    const handleDeletePC = async (id) => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        try {
            await deletePC(id, token);
            fetchPCs();
            showAlert("success", "Raderad", "Din PC har raderats.");
        } catch (err) {
            console.error("Error deleting PC:", err);
            showAlert("error", "Fel", "Kunde inte radera din PC.");
        }
    };

    const handleEditPC = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token || !currentPC) return;
        try {
            await updatePC(
                currentPC.id,
                {
                    name: pcName,
                    description: pcDescription,
                    price: parseInt(pcPrice),
                    imageURL: pcImageURL,
                    isSold: currentPC.isSold
                },
                token
            );
            setShowEditModal(false);
            fetchPCs();
            showAlert("success", "Uppdaterad", "Din PC har uppdaterats.");
        } catch (err) {
            console.error("Error updating PC:", err);
            showAlert("error", "Fel", "Kunde inte uppdatera din PC.");
        }
    };

    const handleAddComponent = async (compId) => {
        const token = localStorage.getItem("accessToken");
        if (!token || !currentPC) return;
        try {
            await addComponentsToPC(currentPC.id, [compId], token);
            fetchPCs();
            fetchComponents();
            showAlert("success", "Uppdaterad", "Komponenten tillagd till din PC.");
        } catch (err) {
            console.error("Error adding component:", err);
            showAlert("error", "Fel", "Kunde inte lägga till dina komponenter.");
        }
    };

    const handleRemoveComponent = async (compId) => {
        const token = localStorage.getItem("accessToken");
        if (!token || !currentPC) return;
        try {
            await removeComponentFromPC(currentPC.id, compId, token);
            setCurrentComponents((prev) => prev.filter((c) => c.id !== compId));
            fetchPCs();
            fetchComponents();
            showAlert("success", "Borttagen", "Komponenten blev borttagen.");
        } catch (err) {
            console.error("Error removing component:", err);
            showAlert("error", "Fel", "Kunde inte ta bort din komponent.");
        }
    };

    const handleToggleSold = async (pc) => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
            await updatePC(pc.id, {
                name: pc.name,
                description: pc.description,
                price: pc.price,
                imageURL: pc.imageURL,
                isSold: !pc.isSold
            }, token);

            fetchPCs();
            showAlert("success", "Uppdaterad", `Datorn har markerats som ${!pc.isSold ? "såld" : "tillbaka i lager"}.`);
        } catch (err) {
            console.error("Error toggling isSold:", err);
            showAlert("error", "Fel", "Kunde inte uppdatera säljinformationen.");
        }
    };

    const handleImageUpload = async (url, pc) => {
        setPcImageURL(url);

        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
            await updatePC(pc.id, {
                name: pc.name,
                description: pc.description,
                price: pc.price,
                imageURL: url,
                isSold: pc.isSold
            }, token);

            fetchPCs();
            showAlert("success", "Bild uppladdad", "Bilden har sparats till din PC.");
        } catch (err) {
            console.error("Image update failed:", err);
            showAlert("error", "Fel", "Kunde inte spara bilden.");
        }
    };

    // Filtrera pågående vs sålda
    const filtered = pcs.filter((pc) =>
        activeTab === "ongoing" ? !pc.isSold : pc.isSold
    );

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setTimeout(() => setAlert(null), 4000); // auto-close efter 4 sek
    };


    return (
        <div>
            {alert && (
                <Alert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            {/* --- Sida­header --- */}
            <div className="max-w-5xl mx-auto text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    PC-Byggaren
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Hantera dina PC-byggen
                </p>
            </div>

            {/* --- Tabbar + Skapa-knapp --- */}
            <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-3 mb-8">
                <button
                    onClick={() => setActiveTab("ongoing")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === "ongoing"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                        }`}
                >
                    🖥️ Pågående byggen ({pcs.filter((p) => !p.isSold).length})
                </button>

                <button
                    onClick={() => setActiveTab("sold")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === "sold"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                        }`}
                >
                    🛒 Sålda byggen ({pcs.filter((p) => p.isSold).length})
                </button>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="ml-auto text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5"
                >
                    + Skapa nytt bygge
                </button>
            </div>
            {/* --- Kort­grid --- */}
            <div className="flex flex-col items-center gap-8">
                {filtered.length > 0 ? (
                    filtered.map((pc) => {
                        const cost = pc.componentsTotalCost || 0;
                        const price = pc.price || 0;
                        const profit = price - cost;
                        const profitPct = price ? Math.round((profit / price) * 100) : 0;

                        return (
                            <div key={pc.id} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-5xl mx-auto mb-6">

                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                            {pc.name.charAt(0)}
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {pc.name}
                                        </h2>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {/* Checkbox */}
                                        <label className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                            <input
                                                type="checkbox"
                                                checked={pc.isSold}
                                                onChange={() => handleToggleSold(pc)}
                                                className="mr-1 accent-blue-600"
                                            />
                                            Såld
                                        </label>

                                        {/* Delete button */}
                                        <button
                                            onClick={() => handleDeletePC(pc.id)}
                                            title="Ta bort bygget"
                                            className="text-gray-400 hover:text-red-500 text-xl"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {/* Divider line */}
                                <hr className="my-4 border-t border-gray-300 dark:border-gray-600" />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                                    <div className="flex flex-col items-center justify-center py-2 text-center text-gray-600 dark:text-gray-300 text-sm">
                                        {pc.imageURL ? (
                                            <img
                                                src={pc.imageURL}
                                                alt="PC bild"
                                                className="h-48 object-contain mb-2 border border-gray-400 dark:border-gray-600"
                                            />
                                        ) : (
                                            <div className="h-48 w-full bg-gray-300 dark:bg-gray-600 mb-2 flex items-center justify-center text-gray-500 dark:text-gray-200 border border-gray-400 dark:border-gray-600">
                                                Ingen bild
                                            </div>
                                        )}
                                        <ImageUploader onUpload={(url) => handleImageUpload(url, pc)} />
                                    </div>

                                    {/* Komponentlista */}
                                    <div className="flex flex-col items-center text-center">
                                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Specifikationer</h3>
                                        {pc.components.length > 0 ? (
                                            pc.components.map((c) => (
                                                <p key={c.id} className="text-sm text-gray-800 dark:text-gray-200">
                                                    <span className="font-semibold">{c.type}:</span> {c.name}
                                                </p>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 italic">Inga komponenter</p>
                                        )}
                                    </div>

                                    {/* Prisinfo */}
                                    <div className="text-center flex flex-col items-center">
                                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Prisinformation
                                        </h3>
                                        <p className="text-sm text-gray-800 dark:text-gray-100">
                                            Total kostnad: <strong>{cost} kr</strong>
                                        </p>
                                        <p className="text-sm text-gray-800 dark:text-gray-100">
                                            Säljpris: <strong>{price} kr</strong>
                                        </p>
                                        <p className={`text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            Vinst: {profit} kr ({profitPct}%)
                                        </p>
                                        <button className="mt-3 px-3 py-1 bg-gray-300 dark:bg-gray-600 text-sm rounded hover:bg-gray-400 dark:hover:bg-gray-500">
                                            Lägg till moms
                                        </button>
                                    </div>
                                </div>                                

                                {/* Actionknappar */}
                                <div className="flex justify-center flex-wrap gap-2 mt-4">
                                    <button
                                        className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5"
                                        onClick={() => {
                                            setCurrentPC(pc);
                                            setPcName(pc.name);
                                            setPcDescription(pc.description || "");
                                            setPcPrice(pc.price || "");
                                            setPcImageURL(pc.imageURL || "");
                                            setShowEditModal(true);
                                        }}
                                    >
                                        Redigera Info
                                    </button>
                                    <button
                                        className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5"
                                        onClick={() => {
                                            setCurrentPC(pc);
                                            setCurrentComponents(pc.components);
                                            setShowCompListModal(true);
                                        }}
                                    >
                                        Komponenter
                                    </button>
                                    <button
                                        className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5"
                                        onClick={() => {
                                            setCurrentPC(pc);
                                            setShowAddCompModal(true);
                                        }}
                                    >
                                        + Komponent
                                    </button>
                                    
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500 italic">Inga byggen att visa.</p>
                )}
            </div>

            {/* --- Modaler --- */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Skapa nytt PC-bygge</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Namn</label>
                            <input
                                type="text"
                                value={pcName}
                                onChange={(e) => setPcName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Skriv namn på PC:n"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleCreatePC}
                                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Skapa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Redigera PC-bygge</h2>

                        {/* Namn */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Namn</label>
                            <input
                                type="text"
                                value={pcName}
                                onChange={(e) => setPcName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        {/* Beskrivning */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Beskrivning</label>
                            <input
                                type="text"
                                value={pcDescription}
                                onChange={(e) => setPcDescription(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        {/* Pris */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Pris</label>
                            <input
                                type="number"
                                value={pcPrice}
                                onChange={(e) => setPcPrice(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        {/* Bild URL */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bild URL</label>
                            <input
                                type="text"
                                value={pcImageURL}
                                onChange={(e) => setPcImageURL(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleEditPC}
                                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Spara
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCompListModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                        {/* Titel */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Komponenter i bygget
                            </h2>
                            <button
                                onClick={() => setShowCompListModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-white text-xl"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Komponentlista */}
                        <div className="space-y-3 max-h-72 overflow-y-auto">
                            {currentComponents.length > 0 ? (
                                currentComponents.map((c) => (
                                    <div key={c.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded">
                                        <span className="text-sm dark:text-white">
                                            <strong>{c.type}:</strong> {c.name}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveComponent(c.id)}
                                            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            Ta bort
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic dark:text-gray-300">
                                    Inga komponenter kopplade till detta bygge.
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowCompListModal(false)}
                                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                            >
                                Stäng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddCompModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Lägg till komponent
                            </h2>
                            <button
                                onClick={() => setShowAddCompModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-white text-xl"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Komponentlista */}
                        <div className="space-y-3 max-h-72 overflow-y-auto">
                            {availableComponents.length > 0 ? (
                                availableComponents.map((c) => (
                                    <div
                                        key={c.id}
                                        className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded"
                                    >
                                        <span className="text-sm dark:text-white">
                                            <strong>{c.type}</strong>: {c.name} — {c.manufacturer}
                                        </span>
                                        <button
                                            onClick={() => handleAddComponent(c.id)}
                                            className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                        >
                                            Lägg till
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic dark:text-gray-300">
                                    Inga tillgängliga komponenter just nu.
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowAddCompModal(false)}
                                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                            >
                                Stäng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PCBuilder;