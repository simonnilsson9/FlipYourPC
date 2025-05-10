import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();

    useEffect(() => {
        const collapseButton = document.querySelector('[data-collapse-toggle]');
        const target = document.getElementById('navbar-cta');
        if (collapseButton && target) {
            collapseButton.addEventListener('click', () => {
                target.classList.toggle('hidden');
            });
        }

        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };

    const linkClass = (path) =>
        `block py-2 px-3 md:p-0 rounded ${location.pathname === path
            ? 'text-blue-400 font-semibold'
            : 'text-white hover:text-blue-300'
        }`;

    const isLoggedIn = !!localStorage.getItem('accessToken');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        window.location.href = '/login'; // tvinga omdirigering
    };

    return (
        <nav className="bg-gray-800 border-b border-gray-700 text-white">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img
                        src="https://flowbite.com/docs/images/logo.svg"
                        className="h-8"
                        alt="Logo"
                    />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap">
                        FlipYourPC
                    </span>
                </Link>

                <div className="flex md:order-2 space-x-3 items-center">
                    <button
                        onClick={toggleTheme}
                        className="text-white hover:text-yellow-400 text-lg"
                        title="Växla tema"
                    >
                        🌓
                    </button>

                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
                        >
                            Logga ut
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
                        >
                            Logga in
                        </Link>
                    )}

                    <button
                        data-collapse-toggle="navbar-cta"
                        type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        aria-controls="navbar-cta"
                        aria-expanded="false"
                    >
                        <span className="sr-only">Öppna meny</span>
                        <svg
                            className="w-5 h-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 17 14"
                            aria-hidden="true"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M1 1h15M1 7h15M1 13h15"
                            />
                        </svg>
                    </button>
                </div>

                <div
                    className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
                    id="navbar-cta"
                >
                    <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-700 rounded-lg bg-gray-800 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-gray-800 text-white">
                        <li><Link to="/" className={linkClass('/')}>Dashboard</Link></li>
                        <li><Link to="/inventory" className={linkClass('/inventory')}>Inventory</Link></li>
                        <li><Link to="/pc-builder" className={linkClass('/pc-builder')}>PC-Builder</Link></li>
                        <li><Link to="/contact" className={linkClass('/contact')}>Contact</Link></li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Header;
