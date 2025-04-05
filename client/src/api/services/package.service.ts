import { axiosInstance } from '../config/axios-instance';
import { Package, PackageGenerateParams } from '@/models/package.model';

export const ROUTE_PREFIX = '/packages';

export const PackageService = {
    async getPackages(packageDate: PackageGenerateParams) {
        try {
            const { data } = await axiosInstance.post<Package[]>(`${ROUTE_PREFIX}/generate`, packageDate);
            return data;
        } catch (error) {
            console.error('Error generating packages:', (error as any).message);
            throw error;
        }
    },

    async getSavedPackages() {
        try {
            const { data } = await axiosInstance.get<Package[]>(`${ROUTE_PREFIX}/saved`);
            return data;
        } catch (error) {
            console.error('Error:', (error as any).message);
            throw error;
        }
    },

    async getHistory(packageDate: PackageGenerateParams) {
        try {
            const { data } = await axiosInstance.post<Package[]>(`${ROUTE_PREFIX}/generate`, packageDate);
            return data;
        } catch (error) {
            console.error('Error generating packages:', (error as any).message);
            throw error;
        }
    },

    async addToHistory(packageDate: PackageGenerateParams) {
        try {
            const { data } = await axiosInstance.post<Package[]>(`${ROUTE_PREFIX}/generate`, packageDate);
            return data;
        } catch (error) {
            console.error('Error generating packages:', (error as any).message);
            throw error;
        }
    },

    async save(packageDate: PackageGenerateParams) {
        try {
            const { data } = await axiosInstance.post<Package[]>(`${ROUTE_PREFIX}/generate`, packageDate);
            return data;
        } catch (error) {
            console.error('Error generating packages:', (error as any).message);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
