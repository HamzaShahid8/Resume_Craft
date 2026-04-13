// services/privateRequest.js
import axios from "axios";

// Create axios instance
const privateRequest = axios.create({
  baseURL:  "http://localhost:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});

//  Add interceptor – this attaches the token to every request
privateRequest.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // token sent automatically
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default privateRequest;