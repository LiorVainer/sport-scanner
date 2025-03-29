import axios from 'axios';
import { calculateCurrentSeason } from '../utils/soccer.utils';
import { ENV } from '../env/env.config';
import { Country, League, Team, Venue } from '../models/soccer.model';
import {
    FixtureQueryParams,
    FixtureQueryParamsSchema,
    FixtureResponse,
    FixtureResponseSchema,
} from '../models/fixture.model';
import qs from 'qs';

const currSeason = calculateCurrentSeason(new Date());

const soccerApiClient = axios.create({
    baseURL: ENV.SOCCER_API_BASE_URL,
    headers: {
        'x-apisports-key': ENV.SOCCER_API_KEY,
    },
});

soccerApiClient.interceptors.request.use((config) => {
    const baseURL = config.baseURL || '';
    const url = config.url || '';
    const query = config.params ? `?${qs.stringify(config.params, { arrayFormat: 'repeat' })}` : '';
    console.log(`Making request to: ${baseURL}${url}${query}`);
    return config;
});

export const soccerService = {
    getCountries: async () => {
        const { data } = await soccerApiClient.get<{ response: Country[]; errors: string[] }>('/countries');
        if (data.errors.length) throw new Error('Error fetching countries');
        return data.response;
    },

    getLeaguesByCountry: async (country: string) => {
        const { data } = await soccerApiClient.get<{
            response: { league: League; country: Country }[];
            errors: string[];
        }>('/leagues', { params: { country } });
        if (data.errors.length) throw new Error('Error fetching leagues');
        return data.response;
    },

    getVenuesByCountry: async (country: string) => {
        const { data } = await soccerApiClient.get<{ response: Venue[]; errors: string[] }>('/venues', {
            params: { country },
        });
        if (data.errors.length) throw new Error('Error fetching venues');
        return data.response;
    },

    getTeamsByLeague: async (league: string, season?: string) => {
        const { data } = await soccerApiClient.get<{
            response: { team: Team; venue: Venue }[];
            errors: string[];
        }>('/teams', {
            params: {
                league,
                season: season || currSeason,
            },
        });
        if (data.errors.length) throw new Error('Error fetching teams');
        return data.response;
    },

    getFixtures: async (params: FixtureQueryParams) => {
        const validatedApiParams = FixtureQueryParamsSchema.safeParse(params);

        if (!validatedApiParams.success) {
            console.log(validatedApiParams.error.flatten());
            throw new Error('Invalid fixture query params');
        }

        const { data } = await soccerApiClient.get<FixtureResponse>('/fixtures', {
            params: validatedApiParams.data,
        });

        const validatedData = FixtureResponseSchema.parse(data);

        if (Object.keys(validatedData.errors).length > 0) {
            console.error({ fixturesResponseErrors: data.errors });
            throw new Error('Error fetching fixtures');
        }

        return validatedData.response;
    },
};
