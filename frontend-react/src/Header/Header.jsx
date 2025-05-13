import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import ThemeToggle from '../Components/ThemeToggle';
import { fetchMyUser } from '../services/API';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [userName, setUserName] = useState(null);
    const location = useLocation();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('accessToken');

    useEffect(() => {
        if (isLoggedIn) {
            fetchMyUser()
                .then(user => setUserName(user.username))
                .catch(err => console.error('Kunde inte hämta användare:', err));
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const linkClass = (path) =>
        `block py-2 px-3 md:p-0 rounded ${location.pathname === path
            ? 'text-blue-400 font-semibold'
            : 'text-white hover:text-blue-300'
        }`;

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate('/logga-in');
    };

    return (
        <nav className="bg-gray-800 border-b border-gray-700 text-white">
            <div className="max-w-screen-xl flex items-center justify-between mx-auto p-2 md:p-4 relative">

                {/* Logotyp */}
                <Link to="/" className="flex items-center space-x-2">
                    <img
                        src="https://flowbite.com/docs/images/logo.svg"
                        className="h-6 md:h-8"
                        alt="Logo"
                    />
                    <span className="hidden md:inline text-xl md:text-2xl font-semibold whitespace-nowrap">FlipYourPCs</span>
                </Link>

                {/* Ikoner & meny */}
                <div className="flex items-center space-x-3 ml-auto md:order-2">

                    {/* Theme toggle */}
                    <ThemeToggle />

                    {/* User dropdown */}
                    {isLoggedIn && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-full cursor-pointer"
                            >
                                <UserCircleIcon className="w-8 h-8 text-white" />
                                <span className="hidden md:block">{userName || "..."}</span>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </button>
                            {isUserDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                        <p className="font-medium text-gray-800 dark:text-white">{userName}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Användare</p>
                                    </div>
                                    <Link to="/mina-sidor" className="block px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setIsUserDropdownOpen(false)}>
                                        Mina sidor
                                    </Link>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-red-400">
                                        Logga ut
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {!isLoggedIn && (
                        <Link
                            to="/logga-in"
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer text-white"
                        >
                            <UserCircleIcon className="w-5 h-5 text-white" />
                            <span className="hidden md:block">Logga in</span>
                        </Link>
                    )}

                    {/* Mobilmenyknapp */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        <span className="sr-only">Öppna meny</span>
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                        </svg>
                    </button>

                </div>

                {/* Navigation links centrerad i desktop endast */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                    <ul className="flex space-x-8 font-medium">
                        <li><Link to="/" className={linkClass('/')}>Dashboard</Link></li>
                        <li><Link to="/lager" className={linkClass('/lager')}>Lager</Link></li>
                        <li><Link to="/pc-byggare" className={linkClass('/pc-byggare')}>PC-Byggare</Link></li>
                    </ul>
                </div>

                {/* Mobilmeny som öppnas under */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out absolute top-full left-0 w-full bg-gray-800 border-t border-gray-700 md:hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <ul className="flex flex-col font-medium p-4">
                        <li><Link to="/" onClick={() => setIsMenuOpen(false)} className={linkClass('/')}>Dashboard</Link></li>
                        <li><Link to="/lager" onClick={() => setIsMenuOpen(false)} className={linkClass('/lager')}>Lager</Link></li>
                        <li><Link to="/pc-byggare" onClick={() => setIsMenuOpen(false)} className={linkClass('/pc-byggare')}>PC-Byggare</Link></li>
                    </ul>
                </div>

            </div>
        </nav>
    );
};

export default Header;
