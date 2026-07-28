import axios from "axios";

const api = axios.create({
baseURL: "http://PCB-SYSTEM:8000",
});

export default api;