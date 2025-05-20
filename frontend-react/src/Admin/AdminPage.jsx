import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, updateUserAsAdmin, deleteUser, changePasswordAsAdmin } from '../services/API';
import Alert from '../Components/Alert';
import ConfirmDeleteModal from "../Components/ConfirmDeleteModal";
import { PencilSquareIcon, TrashIcon, EyeIcon, EyeSlashIcon, LockOpenIcon } from '@heroicons/react/24/solid';

const AdminPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alert, setAlert] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        zipCode: "",
        city: ""
    });

    const [passwordModalUser, setPasswordModalUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordModalError, setPasswordModalError] = useState("");

    const fieldTranslations = {
        username: "Användarnamn",
        email: "E-post",
        firstName: "Förnamn",
        lastName: "Efternamn",
        phoneNumber: "Telefonnummer",
        address: "Adress",
        zipCode: "Postnummer",
        city: "Stad"
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            const decoded = jwtDecode(token);
            const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            if (role !== "Admin") {
                navigate('/');
            } else {
                loadUsers(token);
            }
        } else {
            navigate('/');
        }
    }, [navigate]);

    const loadUsers = async (token) => {
        try {
            const allUsers = await getAllUsers(token);
            setUsers(allUsers);
        } catch (err) {
            setError('Kunde inte hämta användare.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole({ userId, newRole });
            showAlert("success", "Roll uppdaterad", `Roll ändrad till ${newRole}`);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            showAlert("error", "Fel", "Kunde inte uppdatera roll.");
        }
    };


    const handleEditClick = (user) => {
        setEditUser(user);
        setEditForm({
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            address: user.address,
            zipCode: user.zipCode,
            city: user.city
        });
    };

    const handleUpdateUser = async () => {
        try {
            await updateUserAsAdmin(editUser.id, editForm);
            showAlert("success", "Uppdaterad", "Användaren är uppdaterad.");
            setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...editForm } : u));
            setEditUser(null);
        } catch (err) {
            showAlert("error", "Fel", err.message || "Kunde inte uppdatera användaren.");
        }
    };

    const confirmDeleteUser = async () => {
        try {
            await deleteUser(userToDelete.id);
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            showAlert("success", "Borttagen", "Användaren är raderad.");
        } catch (err) {
            showAlert("error", "Fel", "Kunde inte ta bort användaren.");
        } finally {
            setShowConfirm(false);
            setUserToDelete(null);
        }
    };

    const handleDeleteUser = (user) => {
        setUserToDelete(user);
        setShowConfirm(true);
    };

    const handleChangePassword = async () => {
        setPasswordModalError("");

        if (newPassword.length < 6) {
            setPasswordModalError("Lösenordet måste vara minst 6 tecken.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordModalError("Lösenorden stämmer inte överens.");
            return;
        }

        const result = await changePasswordAsAdmin({
            userId: passwordModalUser.id,
            newPassword
        });

        if (!result.success) {
            if (result.status === 400 && result.data.errors) {
                const firstError = Object.values(result.data.errors)[0][0];
                setPasswordModalError(firstError);
            } else if (result.data.error) {
                setPasswordModalError(result.data.error);
            } else {
                setPasswordModalError("Kunde inte ändra lösenord.");
            }
            return;
        }

        showAlert("success", "Lösenord ändrat", "Lösenordet är uppdaterat.");
        setPasswordModalUser(null);
        setNewPassword("");
        setConfirmPassword("");
    };

    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setTimeout(() => setAlert(null), 4000);
    };

    if (loading) return <p className="text-center mt-8 text-gray-500">Laddar användare...</p>;
    if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

    return (
        <div>
            {alert && (
                <Alert type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="max-w-5xl mx-auto text-center mb-8 mt-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    Adminpanel
                </h1>
            </div>

            <div className="max-w-5xl sm:mx-auto mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                            <th className="py-2 w-1/4">Användarnamn</th>
                            <th className="hidden sm:table-cell w-1/4">E-post</th>
                            <th className="w-1/4">Roll</th>
                            <th className="w-1/4 text-right">Åtgärder</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                                <td className="py-2 truncate max-w-[140px]">{user.username}</td>

                                <td className="hidden sm:table-cell">{user.email}</td>

                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-2 py-1 rounded-lg text-xs sm:text-sm w-full"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Användare">Användare</option>
                                    </select>
                                </td>

                                <td className="py-1">
                                    <div className="flex justify-end items-center gap-1 sm:gap-2">
                                        <button
                                            onClick={() => setPasswordModalUser(user)}
                                            title="Ändra lösenord"
                                            className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                                        >
                                            <LockOpenIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            title="Redigera användare"
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user)}
                                            title="Radera användare"
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Redigera användare</h2>
                        {Object.entries(editForm).map(([key, value]) => (
                            <div className="mb-4" key={key}>
                                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-300">{fieldTranslations[key] || key}</label>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                                    className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                                />
                            </div>
                        ))}
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setEditUser(null)}
                                className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-700 rounded dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Uppdatera
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {passwordModalUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Ändra lösenord för {passwordModalUser.username}</h2>

                        {passwordModalError && (
                            <div className="mb-4 text-sm text-red-600 dark:text-red-400">
                                {passwordModalError}
                            </div>
                        )}

                        <div className="mb-4 relative">
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nytt lösenord</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="mb-4 relative">
                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Bekräfta lösenord</label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setPasswordModalUser(null);
                                    setNewPassword("");
                                    setConfirmPassword("");
                                    setPasswordModalError("");
                                }}
                                className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-700 rounded dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleChangePassword}
                                className="px-4 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                            >
                                Ändra lösenord
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmDeleteModal
                isOpen={showConfirm}
                onClose={() => {
                    setShowConfirm(false);
                    setUserToDelete(null);
                }}
                onConfirm={confirmDeleteUser}
                message={`Vill du verkligen ta bort användaren "${userToDelete?.username}"?`}
            />
        </div>
    );
};

export default AdminPage;