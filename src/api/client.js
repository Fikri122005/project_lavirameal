import axios from 'axios';
import { Platform } from 'react-native';

// Ganti URL ini dengan IP Address komputermu jika menggunakan device fisik
// Jika menggunakan Emulator Android, gunakan 'http://10.0.2.2/project/p5/api'
// Jika menggunakan iOS Simulator, gunakan 'http://localhost/project/p5/api'
// Asumsi folder project ada di htdocs atau disajikan via web server

const DEV_BASE_URL = Platform.select({
    android: 'http://10.161.159.35/mobile_api/api/',
    ios: 'http://10.161.159.35/mobile_api/api/',
    default: 'http://10.161.159.35/mobile_api/api/',
});



// NOTE: User perlu menyesuaikan URL ini sesuai setup server PHP mereka
// Misalnya: 'http://192.168.1.X/project/p5/api'

export const API_URL = DEV_BASE_URL;

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tambahkan interceptor untuk debugging
apiClient.interceptors.request.use(request => {
    console.log('Starting Request', JSON.stringify(request.url, null, 2));
    return request;
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        console.log('API Error:', error.response?.status, error.config?.url);
        return Promise.reject(error);
    }
);

export default apiClient;
