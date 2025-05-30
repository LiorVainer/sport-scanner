import { axiosInstance } from '../config/axios-instance';
import { CreateGroupPayload, Group, PopulatedGroup, UpdateGroupPayload } from '@/models/group.model.ts';

export const ROUTE_PREFIX = '/groups';

export const GroupService = {
    async getById(groupId: string) {
        try {
            const { data } = await axiosInstance.get<PopulatedGroup>(`${ROUTE_PREFIX}/${groupId}`);

            return data;
        } catch (error) {
            console.error('Error getting group by id:', (error as any).message);
            throw error;
        }
    },

    async getAll() {
        try {
            const { data } = await axiosInstance.get<PopulatedGroup[]>(`${ROUTE_PREFIX}/`);

            return data;
        } catch (error) {
            console.error('Error getting all groups:', (error as any).message);
            throw error;
        }
    },

    async create(newGroup: CreateGroupPayload) {
        try {
            const { data } = await axiosInstance.post<Group>(`${ROUTE_PREFIX}/`, newGroup);
            return data;
        } catch (error) {
            console.error('Error creating package:', (error as any).message);
            throw error;
        }
    },

    async update(groupId: string, updatedGroup: Partial<UpdateGroupPayload>) {
        try {
            const { data } = await axiosInstance.put<Group>(`${ROUTE_PREFIX}/${groupId}`, updatedGroup);
            return data;
        } catch (error) {
            console.error('Error updating package:', (error as any).message);
            throw error;
        }
    },

    async delete(groupId: string) {
        try {
            const { data } = await axiosInstance.delete<Group>(`${ROUTE_PREFIX}/${groupId}`);
            return data;
        } catch (error) {
            console.error('Error deleting package:', (error as any).message);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
