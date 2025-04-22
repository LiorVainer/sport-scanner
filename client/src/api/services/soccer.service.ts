import { Country, League, Team, Venue } from '@/types/soccer.types';
import { axiosInstance } from '../config/axios-instance';

export const ROUTE_PREFIX = '/soccer';

export const SoccerService = {
    async getCountries(name?: string) {
        try {
            const { data } = await axiosInstance.get<Country[]>(`${ROUTE_PREFIX}/countries`, { params: { name } });
            return data;
        } catch (error) {
            console.error('Error fetching countries:', (error as any).message);
            throw error;
        }
    },

    async getLeagues(country: string | undefined, name?: string) {
        try {
            const { data } = await axiosInstance.get<{ league: League; country: Country }[]>(
                `${ROUTE_PREFIX}/leagues`,
                { params: { country, name } }
            );
            return data;
        } catch (error) {
            console.error('Error fetching leagues:', (error as any).message);
            throw error;
        }
    },

    async getLeaguesByName(name: string) {
        try {
            const { data } = await axiosInstance.get<{ league: League; country: Country }[]>(
                `${ROUTE_PREFIX}/leagues`,
                { params: { name } }
            );
            return data;
        } catch (error) {
            console.error('Error fetching leagues by name:', (error as any).message);
            throw error;
        }
    },

    async getVenues(country: string) {
        try {
            const { data } = await axiosInstance.get<Venue[]>(`${ROUTE_PREFIX}/venues`, { params: { country } });
            return data;
        } catch (error) {
            console.error('Error fetching venues:', (error as any).message);
            throw error;
        }
    },

    async getTeams(name: string) {
        try {
            const { data } = await axiosInstance.get<{ team: Team; venue: Venue }[]>(`${ROUTE_PREFIX}/teams`, {
                params: { name },
            });
            return data;
        } catch (error) {
            console.error('Error fetching teams:', (error as any).message);
            throw error;
        }
    },
} satisfies Record<string, (...args: any[]) => Promise<any>>;
