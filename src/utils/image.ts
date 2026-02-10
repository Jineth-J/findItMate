// Utility to get the full image URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
// Remove /api from the end to get the base URL
const BASE_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

export const getImageUrl = (path: string | undefined | null): string => {
    if (!path) return 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80'; // Default fallback image from RoomCard usage context or similar

    if (path.startsWith('http')) {
        return path;
    }

    if (path.startsWith('/uploads')) {
        return `${BASE_URL}${path}`;
    }

    return path;
};
