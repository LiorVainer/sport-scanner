import { axiosInstance } from '../config/axios-instance';
import { Package, PackageDocument, PackageGenerateParams } from '@/models/package.model';

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

    async getById(packageId: string) {
        try {
            const { data } = await axiosInstance.get<PackageDocument>(`${ROUTE_PREFIX}/${packageId}`);
            return data;
        } catch (error) {
            console.error('Error getting package by id:', (error as any).message);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
