export const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    
    // If it's already a full URL (http/https), return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // Fix for old 'localhost' links being viewed in production
        if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
            if (url.includes('localhost:5001') || url.includes('127.0.0.1:5001')) {
                // If we are in production but the link points to localhost, 
                // try to point it to the production API instead.
                const API_URL = import.meta.env.VITE_API_URL || "https://tapx.bio/api";
                const backendBase = API_URL.replace('/api', '');
                return url.replace(/http:\/\/localhost:5001|http:\/\/127.0.0.1:5001/, backendBase);
            }
        }
        return url;
    }
    
    // If it's a relative path (starts with /uploads), prepend the API base URL
    if (url.startsWith('/uploads')) {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
        const backendBase = API_URL.replace('/api', '');
        return `${backendBase}${url}`;
    }
    
    return url;
};
