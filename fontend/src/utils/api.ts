export const getApiUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('.app.github.dev')) {
        // Tự động chuyển đổi từ port 3000 (frontend) sang 3001 (backend) trên GitHub Codespaces
        return `https://${window.location.hostname.replace('-3000.', '-3001.')}`;
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

export const API_URL = getApiUrl();
