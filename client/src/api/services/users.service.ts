import { PublicUserSchema, User } from '@/models/user.model.ts';
import { axiosInstance } from '../config/axios-instance';

export const ROUTE_PREFIX = '/users';

export const UsersService = {
    async updateUser(userId: string, userData: Partial<User>) {
        try {
            const response = await axiosInstance.put(`${ROUTE_PREFIX}/${userId}`, userData);

            const { data: user, success, error } = PublicUserSchema.safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for updating user with ID ${userId}:`, error);
            }

            return user;
        } catch (error) {
            console.error(`Error updating user with ID ${userId}:`, error);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
