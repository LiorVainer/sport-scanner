import axios, { AxiosError } from 'axios';
import { AuthStorageService } from '@api/services/auth-storage.service.ts';
import { AuthService } from '@api/services/auth.service.ts';
import { ROUTES } from '@/constants/routes.const.ts';

export const SERVER_URL = import.meta.env.VITE_SERVER_URL;

if (!SERVER_URL) {
    throw new Error('Server URL is not defined');
}

export const axiosInstance = axios.create({
    baseURL: SERVER_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(async (config) => {
    const token = AuthStorageService.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            return await handleTokenRefresh(error);
        }

        return Promise.reject(error);
    }
);

const handleTokenRefresh = async (error: AxiosError) => {
    try {
        const refreshToken = AuthStorageService.getRefreshToken();
        if (!refreshToken) {
            AuthStorageService.clearTokens();
            return Promise.reject(error);
        }

        const newTokens = await AuthService.refreshToken(refreshToken);

        if (!!newTokens) {
            AuthStorageService.storeTokens(newTokens?.accessToken, newTokens?.refreshToken);
            if (error.config) {
                error.config.headers.Authorization = `Bearer ${newTokens?.accessToken}`;

                return await axios(error.config);
            }
        }
    } catch (refreshError) {
        AuthStorageService.clearTokens();
        window.location.href = ROUTES.AUTH;

        return Promise.reject(refreshError);
    }
};
