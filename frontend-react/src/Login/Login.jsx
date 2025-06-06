﻿import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: usernameOrEmail, password }),
            });

            if (!response.ok) {
                setErrorMessage('Felaktiga inloggningsuppgifter');
                return;
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('Ett fel inträffade. Försök igen senare.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-md w-full transform -translate-y-10 sm:-translate-y-16">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Logga in</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Användarnamn eller e-post
                        </label>
                        <input
                            type="text"
                            id="usernameOrEmail"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Lösenord
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                    </div>

                    {errorMessage && (
                        <div className="text-sm text-red-500 font-medium">{errorMessage}</div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                        Logga in
                    </button>
                </form>

                <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                    Har du inget konto?{' '}
                    <Link to="/registrera" className="text-blue-500 hover:underline">Registrera dig här</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
