// ThemeToggle.jsx
import React, { useEffect, useState } from 'react';

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
        <button
            onClick={() => setDark(!dark)}
            className="text-sm px-3 py-2 border rounded text-white bg-gray-700 dark:bg-gray-200 dark:text-black"
        >
            {dark ? '🌙 Dark' : '☀️ Light'}
        </button>
    );
};

export default ThemeToggle;
