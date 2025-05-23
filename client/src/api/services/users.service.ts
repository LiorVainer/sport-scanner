import { PublicUserSchema, User } from '@/models/user.model.ts';
import { axiosInstance } from '../config/axios-instance';
import { ROUTE_PREFIX as PACKAGES_ROUTE_PREFIX } from './package.service';
import { History, PopulatedHistory } from '@/models/history.model';
import { PopulatedSavedPackage, SavedPackage } from '@/models/saved-packages.model';
import { PackageWithIdSchema } from '@/models/packages/package.model.ts';

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

    async getUsersHistory() {
        try {
            const { data } = await axiosInstance.get<PopulatedHistory[]>(
                `${ROUTE_PREFIX}${PACKAGES_ROUTE_PREFIX}/history`
            );
            return data;
        } catch (error) {
            console.error('Error:', (error as any).message);
            throw error;
        }
    },

    async addToUsersHistory(packageId: string) {
        try {
            const { data } = await axiosInstance.post<History>(
                `${ROUTE_PREFIX}${PACKAGES_ROUTE_PREFIX}/${packageId}/history`
            );
            return data;
        } catch (error) {
            console.error('Error:', (error as any).message);
            throw error;
        }
    },

    async getUsersSavedPackages(packageId?: string) {
        try {
            const { data } = await axiosInstance.get<PopulatedSavedPackage[]>(
                `${ROUTE_PREFIX}${PACKAGES_ROUTE_PREFIX}/saved`,
                {
                    params: { packageId },
                }
            );
            return data;
        } catch (error) {
            console.error('Error:', (error as any).message);
            throw error;
        }
    },

    async savePackageForUser(packageId: string) {
        try {
            const { data } = await axiosInstance.post<SavedPackage>(
                `${ROUTE_PREFIX}${PACKAGES_ROUTE_PREFIX}/${packageId}/save`
            );
            return data;
        } catch (error) {
            console.error('Error:', (error as any).message);
            throw error;
        }
    },

    async unsavePackageForUser(packageId: string) {
        try {
            const { data } = await axiosInstance.delete<SavedPackage>(
                `${ROUTE_PREFIX}${PACKAGES_ROUTE_PREFIX}/${packageId}/unsave`
            );
            return data;
        } catch (error) {
            console.error('Error:', (error as any).message);
            throw error;
        }
    },

    async getUsers(username?: string) {
        try {
          const { data } = await axiosInstance.get(`${ROUTE_PREFIX}`, {
            params: { username },
          });
          return data;
        } catch (error) {
          console.error('Error fetching users:', error);
          throw error;
        }
    },
      
    async getUsersSuggestedPackages() {
        try {
            const { data } = await axiosInstance.get<PopulatedSavedPackage[]>(
                `${ROUTE_PREFIX}${PACKAGES_ROUTE_PREFIX}/suggested`
            );

            const { data: validPackages, success, error } = PackageWithIdSchema.array().safeParse(data);

            if (!success) {
                console.error('Not valid response for getting users suggested packages:', error);
            }

            return validPackages;
        } catch (error) {
            console.error('Error:', (error as any).message);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
