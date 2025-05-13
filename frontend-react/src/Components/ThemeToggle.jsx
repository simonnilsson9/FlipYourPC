import React, { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

const ThemeToggle = () => {
    const [dark, setDark] = useState(() => {
        return localStorage.theme === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [dark]);

    return (
        <div className="flex items-center space-x-2">
            <SunIcon className="w-5 h-5 text-yellow-400" />
            <button
                onClick={() => setDark(!dark)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${dark ? 'bg-blue-600' : 'bg-gray-400'
                    }`}
            >
                <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${dark ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
            <MoonIcon className="w-5 h-5 text-gray-200" />
        </div>
    );
};

export default ThemeToggle;