import { axiosInstance } from '../config/axios-instance';
import { Group } from '@/models/group.model.ts';
import { GroupFormValues } from '@pages/GroupFormScreen/group-form.schema.ts';

export const ROUTE_PREFIX = '/groups';

export const GroupService = {
    async getById(groupId: string) {
        try {
            const { data } = await axiosInstance.get<Group>(`${ROUTE_PREFIX}/${groupId}`);

            return data;
        } catch (error) {
            console.error('Error getting group by id:', (error as any).message);
            throw error;
        }
    },

    async create(newGroup: GroupFormValues) {
        try {
            const { data } = await axiosInstance.post<Group>(`${ROUTE_PREFIX}/`, newGroup);
            return data;
        } catch (error) {
            console.error('Error creating package:', (error as any).message);
            throw error;
        }
    },

    async update(updatedGroup: GroupFormValues) {
        try {
            const { data } = await axiosInstance.put<Group>(`${ROUTE_PREFIX}/`, updatedGroup);
            return data;
        } catch (error) {
            console.error('Error updating package:', (error as any).message);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
