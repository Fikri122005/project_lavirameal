import axios from 'axios';
import { Platform } from 'react-native';

// Ganti URL ini dengan IP Address komputermu jika menggunakan device fisik
// Jika menggunakan Emulator Android, gunakan 'http://10.0.2.2/project/p5/api'
// Jika menggunakan iOS Simulator, gunakan 'http://localhost/project/p5/api'
// Asumsi folder project ada di htdocs atau disajikan via web server

const DEV_BASE_URL = Platform.select({
    android: 'http://10.120.95.35/mobile_api/api',
    ios: 'http://10.120.95.35/mobile_api/api',
    default: 'http://10.120.95.35/mobile_api/api',

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

export default apiClient;
