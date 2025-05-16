import React, { useEffect, useState } from 'react';
import { fetchMyUser, updateUser, changePassword } from '../services/API';
import Alert from '../components/Alert';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const MyPage = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        zipCode: '',
        city: ''
    });
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: ''
    });
    const [alert, setAlert] = useState(null);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordFormError, setPasswordFormError] = useState('');

    useEffect(() => {
        fetchMyUser().then(setUser).catch(console.error);
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                address: user.address,
                zipCode: user.zipCode,
                city: user.city
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileSave = async () => {
        const result = await updateUser(formData);

        if (!result.success) {
            if (result.status === 400 && result.data.errors) {
                const firstError = Object.values(result.data.errors)[0][0];
                setAlert({ type: 'error', title: 'Fel', message: firstError });
            } else {
                setAlert({ type: 'error', title: 'Fel', message: 'Kunde inte uppdatera profilen.' });
            }
            return;
        }

        // Success
        setAlert({ type: 'success', title: 'Sparad', message: 'Profilen är uppdaterad!' });
    };

    const handlePasswordSave = async () => {
        setPasswordFormError(''); // Rensa ev. tidigare fel

        if (!passwordData.oldPassword || !passwordData.newPassword) {
            setPasswordFormError('Fyll i både nuvarande och nytt lösenord');
            return;
        }

        try {
            await changePassword(passwordData);
            setPasswordData({ oldPassword: '', newPassword: '' });
            setAlert({ type: 'success', title: 'Sparad', message: 'Lösenordet är uppdaterat!' });
        } catch (err) {
            console.error("Error changing password:", err);

            if (err.type === 'validation' && err.errors) {
                // Plocka ut första felet från ModelState
                const firstError = Object.values(err.errors)[0][0];
                setPasswordFormError(firstError);
            } else {
                // Generellt felmeddelande
                setPasswordFormError(err.message || 'Kunde inte uppdatera lösenordet.');
            }
        }
    };

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

    if (!user) return <p className="text-center mt-8">Laddar...</p>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            {alert && (
                <Alert
                    type={alert.type}
                    title={alert.title}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <h2 className="text-xl font-bold mb-8 text-gray-800 dark:text-white text-center">Mina Sidor</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profilinformation */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Profilinformation</h3>
                    {Object.keys(formData).map((key) => (
                        <div key={key} className="mb-4">
                            <label className="block text-sm text-gray-700 dark:text-gray-300 capitalize mb-1">
                                {fieldTranslations[key] || key}
                            </label>
                            <input
                                name={key}
                                value={formData[key]}
                                onChange={handleProfileChange}
                                className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                        </div>
                    ))}
                    <button
                        onClick={handleProfileSave}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                    >
                        Spara ändringar
                    </button>
                </div>

                {/* Lösenordsbyte */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Byt lösenord</h3>
                    {passwordFormError && (
                        <div className="mb-4 text-sm text-red-600 dark:text-red-400">
                            {passwordFormError}
                        </div>
                    )}
                    {/* Nuvarande lösenord med toggle */}
                    <div className="mb-4 relative">
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nuvarande lösenord</label>
                        <input
                            type={showOldPassword ? "text" : "password"}
                            name="oldPassword"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:hover:text-gray-500 cursor-pointer"
                        >
                            {showOldPassword ? (
                                <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                                <EyeIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Nytt lösenord med toggle */}
                    <div className="mb-4 relative">
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nytt lösenord</label>
                        <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            {showNewPassword ? (
                                <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                                <EyeIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <button
                        onClick={handlePasswordSave}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
                    >
                        Uppdatera lösenord
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyPage;