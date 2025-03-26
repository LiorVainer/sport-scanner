import {
    AuthResponseSchema,
    LoginPayload,
    PublicUserSchema,
    RefreshTokenResponseSchema,
    RegisterPayload,
} from '@/models/user.model.ts';
import { axiosInstance } from '../config/axios-instance';

export const ROUTE_PREFIX = '/auth';

export const AuthService = {
    async register(userData: RegisterPayload) {
        try {
            const response = await axiosInstance.post(`${ROUTE_PREFIX}/register`, userData);

            const { data: user, success, error } = AuthResponseSchema.safeParse(response.data);

            if (!success) {
                console.error('Not valid response for registration:', error);
            }

            return user;
        } catch (error) {
            console.error('Error in registartion:', error);
            throw error;
        }
    },
    async login(userData: LoginPayload) {
        try {
            const response = await axiosInstance.post(`${ROUTE_PREFIX}/login`, userData);

            const { data: user, success, error } = AuthResponseSchema.safeParse(response.data);

            if (!success) {
                console.error('Not valid response for login:', error);
            }

            return user;
        } catch (error) {
            console.error('Error in login:', error);
            throw error;
        }
    },

    async refreshToken(refreshToken: string) {
        try {
            const response = await axiosInstance.post(`${ROUTE_PREFIX}/refresh`, { refreshToken });

            const { data: tokens, success, error } = RefreshTokenResponseSchema.safeParse(response.data);

            if (!success) {
                console.error('Not valid response for token refresh:', error);
            }

            return tokens;
        } catch (error) {
            console.error('Error in token refresh:', error);
            throw error;
        }
    },
    async logout(refreshToken: string) {
        try {
            await axiosInstance.post(`${ROUTE_PREFIX}/logout`, { refreshToken });
        } catch (error) {
            console.error('Error in logout:', error);
            throw error;
        }
    },
    async googleLogin(credential: string) {
        try {
            const response = await axiosInstance.post(`${ROUTE_PREFIX}/google`, { credential });

            const { data, success, error } = AuthResponseSchema.safeParse(response.data);

            if (!success) {
                console.error('Not valid response for google login:', error);
            }

            return data;
        } catch (error) {
            console.error('Error in google login:', error);
            throw error;
        }
    },
    async me() {
        try {
            const response = await axiosInstance.get(`${ROUTE_PREFIX}/me`);

            const { data: user, success, error } = PublicUserSchema.safeParse(response.data);

            if (!success) {
                console.error('Not valid response for fetching user:', error);
            }

            return user ?? null;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
