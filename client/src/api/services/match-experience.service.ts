import { z } from 'zod';
import { axiosInstance } from '../config/axios-instance';
import {
    CreateMatchExperienceBody,
    MatchExperience,
    MatchExperiencePayloadSchema,
    MatchExperienceSchema,
    PaginatedMatchExperiencesSchema,
} from '@/models/match-experience.model';
import { OkResponseSchema } from '@/models/response.model.ts';

export const ROUTE_PREFIX = 'match-experiences';

export const MatchExperienceService = {
    async getAllMatchExperience(page = 1, limit = 8, sortBy = 'date') {
        try {
            const response = await axiosInstance.get(ROUTE_PREFIX, {
                params: { page, limit, sortBy },
            });

            const { data, success, error } = PaginatedMatchExperiencesSchema.safeParse(response.data);
            if (!success) {
                console.error('Invalid response format for paginated match experiences:', error);
            }

            return data;
        } catch (error) {
            console.error('Error fetching matchExperience:', error);
            throw error;
        }
    },

    async getAllMatchExperiencesByUserId(userId: string | undefined, page = 1, limit = 6, sortBy = 'date') {
        try {
            if (!userId) return;
            const response = await axiosInstance.get(`${ROUTE_PREFIX}/user/${userId}`, {
                params: { page, limit, sortBy },
            });

            const { data, success, error } = PaginatedMatchExperiencesSchema.safeParse(response.data);
            if (!success) {
                console.error(`Invalid response format for user ${userId} match experiences:`, error);
            }

            return data;
        } catch (error) {
            console.error(`Error fetching match experiences for user ${userId}:`, error);
            throw error;
        }
    },

    async getMatchExperienceById(id: string) {
        try {
            const response = await axiosInstance.get<MatchExperience>(`${ROUTE_PREFIX}/${id}`);

            const { data: matchExperience, success, error } = MatchExperienceSchema.safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for fetching matchExperience with ${id}`, error);
            }

            return matchExperience;
        } catch (error) {
            console.error(`Error fetching matchExperience with ID ${id}:`, error);
            throw error;
        }
    },

    async createMatchExperience(matchExperienceData: CreateMatchExperienceBody) {
        try {
            const response = await axiosInstance.post(ROUTE_PREFIX, matchExperienceData);

            const { data: matchExperience, success, error } = MatchExperiencePayloadSchema.safeParse(response.data);

            if (!success) {
                console.error('Not valid response for creating matchExperience:', error);
            }

            return matchExperience;
        } catch (error) {
            console.error('Error creating matchExperience:', error);
            throw error;
        }
    },

    async updateMatchExperience(id: string, matchExperienceData: Partial<MatchExperience>) {
        try {
            const response = await axiosInstance.put(`${ROUTE_PREFIX}/${id}`, matchExperienceData);

            const { data: matchExperience, success, error } = MatchExperiencePayloadSchema.safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for updating matchExperience with ID ${id}:`, error);
            }

            return matchExperience;
        } catch (error) {
            console.error(`Error updating matchExperience with ID ${id}:`, error);
            throw error;
        }
    },

    async deleteMatchExperience(id: string) {
        try {
            const response = await axiosInstance.delete(`${ROUTE_PREFIX}/${id}`);

            const { data: resMatchExperienceId, success, error } = z.string().safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for deleting matchExperience with ID ${id}:`, error);
            }

            return resMatchExperienceId;
        } catch (error) {
            console.error(`Error deleting matchExperience with ID ${id}:`, error);
            throw error;
        }
    },

    async likeMatchExperience(matchExpId: string) {
        try {
            const response = await axiosInstance.post(`${ROUTE_PREFIX}/${matchExpId}/like`);

            const { data, success, error } = OkResponseSchema.safeParse(response.data);

            if (!success) {
                console.error(error);
            }

            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    async unlikeMatchExperience(matchExpId: string) {
        try {
            const response = await axiosInstance.post(`${ROUTE_PREFIX}/${matchExpId}/unlike`);

            const { data, success, error } = OkResponseSchema.safeParse(response.data);

            if (!success) {
                console.error(error);
            }

            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    async addComment(id: string, comment: string) {
        try {
            const response = await axiosInstance.post(`${ROUTE_PREFIX}/${id}/comments`, {
                content: comment,
            });

            const { data, success, error } = z.string().safeParse(response.data);

            if (!success) {
                console.error(`Not valid response for deleting matchExperience with ID ${id}:`, error);
            }

            return data;
        } catch (error) {
            console.error(`Error deleting matchExperience with ID ${id}:`, error);
            throw error;
        }
    },

    async betterDescription(matchExperienceData: Partial<CreateMatchExperienceBody>) {
        try {
            const { data } = await axiosInstance.get<string>(`${ROUTE_PREFIX}/better-description`, {
                params: { ...matchExperienceData },
            });

            if (!data) {
                console.error('Not valid response for generating text');
            }

            return data;
        } catch (error) {
            console.error('Error fetching chat:', error);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
