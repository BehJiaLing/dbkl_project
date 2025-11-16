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

// const baseURL = "http://localhost:3001";

// const axiosInstance = axios.create({
//     baseURL: baseURL,
// });

// export default axiosInstance;

// const baseURL = "http://localhost:3001"; 
// const axiosInstance = axios.create({
//     baseURL,
// });

// // Add a request interceptor to attach JWT token
// axiosInstance.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("authToken");
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// export default axiosInstance;

const baseURL = "http://localhost:3001";

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true, // send cookies (authToken) automatically
});

export default axiosInstance;
