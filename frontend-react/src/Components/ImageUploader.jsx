import React, { useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid';

const API_URL = import.meta.env.VITE_API_URL;

const ImageUploader = ({ onUpload }) => {
    const [uploading, setUploading] = useState(false);

    const handleChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const res = await fetch(`${API_URL}/image/upload`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            onUpload(data.url); // Skickar upp URL:en till PCBuilder
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2 w-full">
            <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleChange}
                disabled={uploading}
                className="hidden"
            />
            <label
                htmlFor="file-upload"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg cursor-pointer hover:opacity-90 transition duration-200"
            >
                <PhotoIcon className="h-5 w-5" />
                Ändra bild
            </label>
            {uploading && (
                <span className="text-xs text-gray-500 dark:text-gray-400">Laddar upp...</span>
            )}
        </div>
    );
};

export default ImageUploader;
