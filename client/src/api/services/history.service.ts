import { axiosInstance } from '../config/axios-instance';
import { Package, PackageDocument } from '@/models/package.model';
import { History } from '@/models/history.model';

export const ROUTE_PREFIX = '/histories';

export const HistoryService = {
    async getUsersHistory() {
        try {
            const { data } = await axiosInstance.get<PackageDocument[]>(`${ROUTE_PREFIX}/`);
            return data;
        } catch (error) {
            console.error('Error:', (error as any).message);
            throw error;
        }
    },

    async addToUsersHistory(selectedPackage: Package) {
        try {
            const { data } = await axiosInstance.post<History>(`${ROUTE_PREFIX}/`, selectedPackage);
            return data;
        } catch (error) {
            console.error('Error:', (error as any).message);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
