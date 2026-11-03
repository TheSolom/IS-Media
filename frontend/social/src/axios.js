import axios from "axios";

export const API_URL =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === "production"
        ? "https://is-media-backend.vercel.app"
        : "http://localhost:5000");

export const makeRequest = axios.create({
    baseURL: `${API_URL.replace(/\/+$/, "")}/api/v1/`,
    withCredentials: true,
});

export default makeRequest;
