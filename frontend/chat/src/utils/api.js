export const API_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
        ? "https://is-media-backend.vercel.app"
        : "http://localhost:5000");

export const BASE_API_URL = `${API_URL.replace(/\/+$/, "")}/api/v1`;
