import axios from 'axios';

// const baseURL = process.env.NODE_ENV === "development"
//     ? "http://localhost:3001"       // Use localhost for development
//     : "http://172.20.10.4:3001";    // Use IP address for production or testing

// const axiosInstance = axios.create({
//     baseURL: baseURL,
//     headers: {
//         "Content-Type": "application/json"
//     }
// });

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

const axiosInstance = axios.create({
    baseURL: baseURL,
});

export default axiosInstance;
