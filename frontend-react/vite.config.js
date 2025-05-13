import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),  // För React plugin
        tailwindcss(),  // För Tailwind CSS plugin
    ],
    server: {
        port: 51780,  // Använd en specifik port för utvecklingsservern
    },
});
