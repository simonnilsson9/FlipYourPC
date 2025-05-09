import React, { useEffect, useState } from "react";

const Alert = ({ type = "default", title, message, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const isError = type === "error" || type === "danger";

    const alertClasses = `
        fixed top-6 right-6 z-50 w-full max-w-md rounded-xl shadow-xl px-6 py-5 border-l-8 transition-all duration-300 transform
        ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        ${isError
            ? "bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-200 dark:border-red-600"
            : "bg-gray-100 border-gray-400 text-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"}
    `;

    return (
        <div className={alertClasses} role="alert">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold mb-1">{title}</h3>
                    <p className="text-base leading-snug">{message}</p>
                </div>
                <button
                    onClick={() => {
                        setVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="text-xl font-bold hover:opacity-70 ml-4"
                    aria-label="Stäng"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Alert;
