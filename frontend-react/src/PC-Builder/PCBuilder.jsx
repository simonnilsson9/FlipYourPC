import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../Components/Alert";
import ImageUploader from "../Components/ImageUploader"; 
import ComponentTypeEnum, { ComponentTypeTranslations } from "../Components/ComponentTypeEnum";
import ConfirmDeleteModal from "../Components/ConfirmDeleteModal";
import ComponentModal from "../Components/ComponentModal";
import SalesTextPopup from "../Components/SalesTextPopup";
import ExportPCs from "../Export/ExportPCs";
import { WrenchScrewdriverIcon, ShoppingCartIcon, ChevronDownIcon, TrashIcon, TagIcon, PencilSquareIcon, PlusIcon, EllipsisVerticalIcon, DocumentTextIcon, ArrowUturnLeftIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import {
    getAllPCs,
    createPC,
    addComponentsToPC,
    deletePC,
    updatePC,
    fetchInventory,
    removeComponentFromPC,
    saveComponent
} from "../services/API";

const PCBuilder = () => {
    const [pcs, setPcs] = useState([]);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [activeTab, setActiveTab] = useState("planning");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCompListModal, setShowCompListModal] = useState(false);
    const [showAddCompModal, setShowAddCompModal] = useState(false);
    const [editingComponent, setEditingComponent] = useState(null);
    const [showEditComponentModal, setShowEditComponentModal] = useState(false);
    const [pcFormError, setPcFormError] = useState("");

    const [currentPC, setCurrentPC] = useState(null);
    const [currentComponents, setCurrentComponents] = useState([]);

    const [pcName, setPcName] = useState("");
    const [pcDescription, setPcDescription] = useState("");
    const [pcPrice, setPcPrice] = useState("");
    const [listedAt, setListedAt] = useState("");
    const [soldAt, setSoldAt] = useState("");

    const [alert, setAlert] = useState(null);
    const [activeAddType, setActiveAddType] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pcToDelete, setPcToDelete] = useState(null);
    const [expandedPCs, setExpandedPCs] = useState([]);
    const [showSalesTextModal, setShowSalesTextModal] = useState(false);
    const [salesTextPC, setSalesTextPC] = useState(null);
    const [pcListPrice, setPcListPrice] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const pcsPerPage = 6; // Antal datorer per sida (justerbart)

    const navigate = useNavigate();

    const [showMenuId, setShowMenuId] = useState(null);
    const toggleMenu = (id) => {
        setShowMenuId(prev => prev === id ? null : id);
    };

    useEffect(() => {
        fetchPCs();
        fetchComponents();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const togglePCSection = (id) => {
        setExpandedPCs(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

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
        const result = await createPC({ name: pcName, listedAt: new Date().toISOString() });

        if (!result.success) {
            if (result.status === 400 && result.data.errors) {
                const firstError = Object.values(result.data.errors)[0][0];
                setPcFormError(firstError);
            } else {
                setPcFormError("Kunde inte skapa bygget.");
            }
            return;
        }

        // Success
        setPcFormError("");
        setShowCreateModal(false);
        setPcName("");
        fetchPCs();
        showAlert("success", "Skapad", "Din PC har skapats.");
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
        if (!currentPC) return;

        const pcUpdateData = {
            name: pcName,
            description: pcDescription,
            price: parseInt(pcPrice) || 0,
            imageURL: currentPC.imageURL,
            listedAt: listedAt || currentPC.listedAt,
            soldAt: soldAt === "" ? null : soldAt,
            status: currentPC.status, 
            listPrice: parseInt(pcListPrice)
        };

        const result = await updatePC(currentPC.id, pcUpdateData);

        if (!result.success) {
            if (result.status === 400 && result.data.errors) {
                const firstError = Object.values(result.data.errors)[0][0];
                setPcFormError(firstError);
            } else {
                setPcFormError("Kunde inte uppdatera PC:n.");
            }
            return;
        }

        // Success
        setPcFormError("");
        setShowEditModal(false);
        fetchPCs();
        showAlert("success", "Uppdaterad", "Din PC har uppdaterats.");
    };

    const handleAddComponent = async (compId) => {
        const token = localStorage.getItem("accessToken");
        if (!token || !currentPC) return;
        try {
            await addComponentsToPC(currentPC.id, [compId], token);
            fetchPCs();
            setShowAddCompModal(false);
            fetchComponents();
            showAlert("success", "Uppdaterad", "Komponenten tillagd till din PC.");
        } catch (err) {
            console.error("Error adding component:", err);
            showAlert("error", "Fel", "Kunde inte lägga till dina komponenter.");
        }
    };

    const handleRemoveComponent = async (pc, compId) => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
            await removeComponentFromPC(pc.id, compId, token);
            fetchPCs();
            fetchComponents();
            showAlert("success", "Borttagen", "Komponenten blev borttagen.");
        } catch (err) {
            console.error("Error removing component:", err);
            showAlert("error", "Fel", "Kunde inte ta bort din komponent.");
        }
    };

    const handleChangeStatus = async (pc, newStatus) => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
            await updatePC(pc.id, {
                name: pc.name,
                description: pc.description,
                price: pc.price,
                imageURL: pc.imageURL,
                listedAt: pc.listedAt,
                soldAt: newStatus === "Sold" ? new Date().toISOString() : null,
                status: newStatus
            }, token);

            fetchPCs();
            showAlert("success", "Status ändrad", `Datorn är nu ${newStatus === "Sold" ? "såld" : newStatus === "ForSale" ? "till försäljning" : "i planering"}.`);
        } catch (err) {
            console.error("Error changing status:", err);
            showAlert("error", "Fel", "Kunde inte ändra status.");
        }
    };

    const handleImageUpload = async (url, pc) => {

        const token = localStorage.getItem("accessToken");
        if (!token) return;

        try {
            await updatePC(pc.id, {
                name: pc.name,
                description: pc.description,
                price: pc.price,
                imageURL: url,
                listedAt: pc.listedAt,
                soldAt: pc.soldAt,
                status: pc.status
            }, token);

            fetchPCs();
            showAlert("success", "Bild uppladdad", "Bilden har sparats till din PC.");
        } catch (err) {
            console.error("Image update failed:", err);
            showAlert("error", "Fel", "Kunde inte spara bilden.");
        }
    };

    const confirmDeletePC = async () => {
        if (pcToDelete) {
            await handleDeletePC(pcToDelete.id);
            setPcToDelete(null);
            setShowConfirm(false);
        }
    };

    // Filtrera pågående vs sålda
    const filtered = pcs.filter((pc) => {
        if (activeTab === "sold") return pc.status === "Sold";
        if (activeTab === "forsale") return pc.status === "ForSale";
        if (activeTab === "planning") return pc.status === "Planning";
        return true;
    });

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setTimeout(() => setAlert(null), 4000); // auto-close efter 4 sek
    };

    const indexOfLastPC = currentPage * pcsPerPage;
    const indexOfFirstPC = indexOfLastPC - pcsPerPage;
    const currentPCs = filtered.slice(indexOfFirstPC, indexOfLastPC);
    const totalPages = Math.ceil(filtered.length / pcsPerPage);

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
            <div className="max-w-5xl mx-auto text-center mb-8 mt-8">
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
                    onClick={() => setActiveTab("planning")}
                    className={`inline-flex cursor-pointer px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === "planning"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-600 dark:text-white"
                        }`}
                >
                    <WrenchScrewdriverIcon className="inline w-5 h-5 mr-1" />
                    Planering ({pcs.filter((p) => p.status === "Planning").length})
                </button>

                <button
                    onClick={() => setActiveTab("forsale")}
                    className={`inline-flex cursor-pointer px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === "forsale"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-600 dark:text-white"
                        }`}
                >
                    <TagIcon className="inline w-5 h-5 mr-1" />
                    Till salu ({pcs.filter((p) => p.status === "ForSale").length})
                </button>

                <button
                    onClick={() => setActiveTab("sold")}
                    className={`inline-flex cursor-pointer px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === "sold"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-600 dark:text-white"
                        }`}
                >
                    <ShoppingCartIcon className="inline w-5 h-5 mr-1" />
                    Sålda PCs ({pcs.filter((p) => p.status === "Sold").length})
                </button>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg text-sm cursor-pointer"
                >
                    <PlusIcon className="w-5 h-5" />
                    Ny PC
                </button>
                <ExportPCs />
            </div>

            {/* --- Kort­grid --- */}
            <div className="flex flex-col items-center">
                {filtered.length > 0 ? (
                    currentPCs.map((pc) => {
                        const cost = pc.componentsTotalCost || 0;
                        const price = pc.price || 0;
                        const profit = price - cost;
                        const profitPct = price ? Math.round((profit / price) * 100) : 0;

                        return (
                            <div key={pc.id} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 w-full max-w-5xl mx-auto mb-6">
                                {/* Header hela som toggle */}
                                <div
                                    onClick={() => togglePCSection(pc.id)}
                                    className="flex items-center justify-between cursor-pointer rounded-lg p-2 transition"
                                >
                                    {/* Vänster: Ikon + Namn */}
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                            {pc.name.charAt(0)}
                                        </div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {pc.name}
                                        </h2>
                                    </div>

                                    {/* Höger: Chevron + status + knappar (klick ska inte toggla) */}
                                    <div
                                        className="flex items-center space-x-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Chevron för att indikera expand/collapse */}
                                        <ChevronDownIcon
                                            className={`w-5 h-5 text-gray-500 dark:text-gray-300 transition-transform duration-300 ease-in-out ${expandedPCs.includes(pc.id) ? 'rotate-180' : 'rotate-0'}`}
                                        />

                                        {/* Status */}
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                ${pc.status === "Sold"
                                                    ? 'bg-green-100 text-green-700'
                                                    : pc.status === "ForSale"
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}
                                        >
                                            {pc.status === "Sold"
                                                ? 'Såld'
                                                : pc.status === "ForSale"
                                                    ? 'Till salu'
                                                    : 'Planering'}
                                        </span>

                                        {/* Menyknapp */}
                                        <div className="relative">
                                            <button
                                                onClick={() => toggleMenu(pc.id)}
                                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                                title="Fler åtgärder"
                                            >
                                                <EllipsisVerticalIcon className="w-5 h-5 text-gray-700 dark:text-white" />
                                            </button>

                                            {showMenuId === pc.id && (
                                                <div className="absolute right-0 z-10 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                                                    <button
                                                        onClick={() => {
                                                            setCurrentPC(pc);
                                                            setPcName(pc.name);
                                                            setPcDescription(pc.description || "");
                                                            setPcPrice(pc.price || "");
                                                            setPcListPrice(pc.listPrice || "");
                                                            setListedAt(pc.listedAt ? pc.listedAt.split("T")[0] : "");
                                                            setSoldAt(pc.soldAt ? pc.soldAt.split("T")[0] : "");
                                                            setShowEditModal(true);
                                                            setShowMenuId(null);
                                                        }}
                                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition" />
                                                        Redigera info
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setSalesTextPC(pc);
                                                            setShowSalesTextModal(true);
                                                            setShowMenuId(null);
                                                        }}
                                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                                                    >
                                                        <DocumentTextIcon className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600 transition" />
                                                        Generera försäljningstext
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            handleChangeStatus(pc, pc.status === "Sold" ? "ForSale" : "Sold");
                                                            setShowMenuId(null);
                                                        }}
                                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        {pc.status === "Sold" ? (
                                                            <>
                                                                <ArrowUturnLeftIcon className="w-4 h-4 text-yellow-600 group-hover:text-yellow-700 dark:text-yellow-400 dark:group-hover:text-yellow-300 transition" />
                                                                <span>Ångra försäljning</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                    <CurrencyDollarIcon className="w-4 h-4 text-green-600 group-hover:text-green-700 dark:text-green-400 dark:group-hover:text-green-300 transition" />
                                                                <span>Markera som såld</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    {pc.status === "Planning" && (
                                                        <button
                                                            onClick={() => {
                                                                handleChangeStatus(pc, "ForSale");
                                                                setShowMenuId(null);
                                                            }}
                                                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            <TagIcon className="w-4 h-4 text-amber-600 group-hover:text-amber-700 dark:text-amber-400 dark:group-hover:text-amber-300 transition" />
                                                            <span>Flytta till försäljning</span>
                                                        </button>
                                                    )}

                                                    {pc.status === "ForSale" && (
                                                        <button
                                                            onClick={() => {
                                                                handleChangeStatus(pc, "Planning");
                                                                setShowMenuId(null);
                                                            }}
                                                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            <WrenchScrewdriverIcon className="w-4 h-4 text-sky-600 group-hover:text-sky-700 dark:text-sky-400 dark:group-hover:text-sky-300 transition" />
                                                            <span>Flytta till planering</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            setPcToDelete(pc);
                                                            setShowConfirm(true);
                                                            setShowMenuId(null);
                                                        }}
                                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <TrashIcon className="w-4 h-4 group-hover:text-red-700 dark:group-hover:text-red-300 transition" />
                                                        Radera PC
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Animated expandable area */}
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedPCs.includes(pc.id) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <hr className="my-4 border-t border-gray-300 dark:border-gray-600" />

                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-6">
                                        {/* Bild */}
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
                                            <ImageUploader
                                                pcId={pc.id}
                                                onUpload={(url) => handleImageUpload(url, pc)}
                                            />
                                        </div>

                                        {/* Specifikationer */}
                                        <div className="flex flex-col items-center text-center">
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Specifikationer</h3>
                                            {Object.values(ComponentTypeEnum).map((type) => {
                                                const existingComponent = pc.components.find((c) => c.type === type);
                                                return (
                                                    <div key={type} className="flex items-center justify-between w-full px-4 py-1">
                                                        <span className="text-sm text-gray-800 dark:text-gray-200">
                                                            <strong>{ComponentTypeTranslations[type] || type}:</strong>{" "}
                                                            {existingComponent ? existingComponent.name : <em>Inget valt</em>}
                                                        </span>
                                                        <div className="ml-2 flex gap-2">
                                                            {existingComponent ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingComponent(existingComponent);
                                                                            setShowEditComponentModal(true);
                                                                        }}
                                                                        className="text-xs text-yellow-600 hover:text-yellow-800"
                                                                    >
                                                                        <PencilSquareIcon className="w-5 h-5 inline" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRemoveComponent(pc, existingComponent.id)}
                                                                        className="text-xs text-red-500 hover:text-red-700"
                                                                    >
                                                                        <TrashIcon className="w-5 h-5 inline" />
                                                                    </button>                                                                    
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setCurrentPC(pc);
                                                                        setActiveAddType(type);
                                                                        setShowAddCompModal(true);
                                                                    }}
                                                                    className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer"
                                                                >
                                                                    Lägg till
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                        </div>

                                        {/* Prisinfo */}
                                        <div className="text-center flex flex-col items-center">
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Prisinformation</h3>
                                            <p className="text-sm text-gray-800 dark:text-gray-100">Total kostnad: <strong>{cost} kr</strong></p>
                                            <p className="text-sm text-gray-800 dark:text-gray-100">Utgångspris: <strong>{pc.listPrice ?? "–"} kr</strong></p>
                                            <p className="text-sm text-gray-800 dark:text-gray-100">Slutpris: <strong>{price} kr</strong></p>
                                            <p className={`text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                Vinst: {profit} kr ({profitPct}%)
                                            </p>
                                            {pc.soldAt && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Såld: {new Date(pc.soldAt).toLocaleDateString()}
                                                </p>
                                            )}                                            
                                        </div>
                                    </div>                                   
                                </div>
                            </div>

                        );
                    })
                ) : (
                    <p className="text-gray-500 italic">Inga byggen att visa.</p>
                )}
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-1 items-center">
                    {/* Föregående knapp */}
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 text-sm rounded bg-gray-600 text-white hover:bg-gray-700 transition ${currentPage === 1 ? "cursor-not-allowed" : ""
                            }`}
                    >
                        «
                    </button>

                    {/* Sidnummer */}
                    {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        const isActive = currentPage === page;
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 text-sm font-medium rounded transition ${isActive
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-600 text-white hover:bg-gray-700"
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    {/* Nästa knapp */}
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 text-sm rounded bg-gray-600 text-white hover:bg-gray-700 transition ${currentPage === totalPages ? "ocursor-not-allowed" : ""
                            }`}
                    >
                        »
                    </button>
                </div>
            )}

            {/* --- Modaler --- */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Skapa nytt PC-bygge</h2>
                        {pcFormError && (
                            <div className="mb-4 text-sm text-red-600 dark:text-red-400">
                                {pcFormError}
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-300">Namn</label>
                            <input
                                type="text"
                                value={pcName}
                                onChange={(e) => {
                                    setPcName(e.target.value);
                                    setPcFormError("");
                                }}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                                placeholder="Skriv namn på PC:n"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-700 rounded dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
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
                        {pcFormError && (
                            <div className="mb-4 text-sm text-red-600 dark:text-red-400">
                                {pcFormError}
                            </div>
                        )}
                        {/* Namn */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Namn</label>
                            <input
                                type="text"
                                value={pcName}
                                onChange={(e) => {
                                    setPcName(e.target.value);
                                    setPcFormError("");
                                }}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Beskrivning */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Beskrivning</label>
                            <input
                                type="text"
                                value={pcDescription}
                                onChange={(e) => setPcDescription(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* List-Pris */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-300">Utgångspris</label>
                            <input
                                type="number"
                                value={pcListPrice}
                                onChange={(e) => setPcListPrice(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Sälj-Pris */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Slutpris</label>
                            <input
                                type="number"
                                value={pcPrice}
                                onChange={(e) => {
                                    setPcPrice(e.target.value)
                                    setPcFormError("");
                                }}
                                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                        </div>                        

                        {/* Listat datum */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Listat datum
                            </label>
                            <input
                                type="date"
                                value={listedAt}
                                onChange={(e) => {
                                    setListedAt(e.target.value);
                                    setPcFormError("");
                                }}
                                className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white ${pcFormError.includes('Listat') ? 'border-red-500' : ''}`}
                            />
                        </div>

                        {/* Sålt datum */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Sålt datum (valfritt)
                            </label>
                            <input
                                type="date"
                                value={soldAt}
                                onChange={(e) => {
                                    setSoldAt(e.target.value);
                                    setPcFormError("");
                                }}
                                className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white ${pcFormError.includes('Sålt') ? 'border-red-500' : ''}`}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-700 rounded dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
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
                                Lägg till komponent - {ComponentTypeTranslations[activeAddType] || activeAddType}
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
                            {availableComponents.filter(c => c.type === activeAddType).length > 0 ? (
                                availableComponents
                                    .filter(c => c.type === activeAddType)
                                    .map((c) => (
                                        <div
                                            key={c.id}
                                            className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded"
                                        >
                                            <div className="flex flex-col text-sm text-gray-900 dark:text-white">
                                                <span className="font-semibold">{c.name}</span>
                                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                                    {c.manufacturer} — {c.price.toLocaleString()} kr
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleAddComponent(c.id)}
                                                className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 cursor-pointer"
                                            >
                                                Lägg till
                                            </button>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-gray-500 italic dark:text-gray-300">
                                    Inga tillgängliga komponenter av typen {ComponentTypeTranslations[activeAddType] || activeAddType}.
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => {
                                    setShowAddCompModal(false);
                                    setActiveAddType(null);
                                }}
                                className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-700 rounded dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                            >
                                Stäng
                            </button>
                        </div>
                    </div>
                </div>
            )}  

            {showSalesTextModal && salesTextPC && (
                <SalesTextPopup
                    pc={salesTextPC}
                    onClose={() => {
                        setSalesTextPC(null);
                        setShowSalesTextModal(false);
                    }}
                />
            )}

            <ComponentModal
                isOpen={showEditComponentModal}
                component={editingComponent}
                setComponent={setEditingComponent}
                onCancel={() => setShowEditComponentModal(false)}
                onSave={async () => {
                    try {
                        const result = await saveComponent({
                            ...editingComponent,
                            price: parseInt(editingComponent.price),
                        });

                        if (result.success) {
                            fetchPCs();
                            setShowEditComponentModal(false);
                            showAlert("success", "Sparad", "Komponenten har uppdaterats.");
                        } else {
                            showAlert("error", "Fel", "Misslyckades spara ändring.");
                        }
                    } catch {
                        showAlert("error", "Fel", "Något gick fel.");
                    }
                }}
                modalError={null}
            />

            <ConfirmDeleteModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmDeletePC}
                message={`Vill du verkligen radera bygget "${pcToDelete?.name}"?`}
            />            
        </div>
    );
};

export default PCBuilder;