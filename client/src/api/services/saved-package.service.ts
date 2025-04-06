import { SavedPackage } from '@/models/saved-packages.model';
import { axiosInstance } from '../config/axios-instance';
import { Package } from '@/models/package.model';

export const ROUTE_PREFIX = '/saved-packages';

export const SavedPackageService = {
    async getUsersSavedPackages() {
        try {
            const { data } = await axiosInstance.get<Package[]>(`${ROUTE_PREFIX}/`);
            return data;
        } catch (error) {
            console.error('Error:', (error as any).message);
            throw error;
        }
    },

    async savePackage(packageId: string) {
        try {
            const { data } = await axiosInstance.post<SavedPackage>(`${ROUTE_PREFIX}/`, { packageId });
            return data;
        } catch (error) {
            console.error('Error:', (error as any).message);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
