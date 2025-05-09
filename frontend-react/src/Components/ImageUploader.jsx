import React, { useState } from 'react';

const API_URL = "https://localhost:7177/api";

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
                type="file"
                accept="image/*"
                onChange={handleChange}
                disabled={uploading}
                className="text-sm text-gray-700 dark:text-gray-300"
            />
            {uploading && (
                <span className="text-xs text-gray-500 dark:text-gray-400">Laddar upp...</span>
            )}
        </div>
    );
};

export default ImageUploader;
