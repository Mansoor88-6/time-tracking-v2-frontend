// src/utils/axiosInstance.ts
import axios from "axios";

const api = axios.create({
  baseURL: "localhost:3401",
  withCredentials: true, // Include cookies for secure session handling
});

export default api;
