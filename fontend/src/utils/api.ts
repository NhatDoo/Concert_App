export const getApiUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('.app.github.dev')) {
        return '/api';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

export const API_URL = getApiUrl();
