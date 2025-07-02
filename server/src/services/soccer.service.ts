import axios from 'axios';
import { calculateCurrentSeason } from '../utils/soccer.utils';
import { ENV } from '../env/env.config';
import { League, Team, Venue } from '../models/soccer/soccer.model';
import {
    FixtureQueryParams,
    FixtureQueryParamsSchema,
    FixtureResponse,
    FixtureResponseSchema,
} from '../models/soccer/fixture.model';
import qs from 'qs';
import { Country } from '../models/geo.model';
import {
    PackagesGenerationParams,
    PackagesGenerationParamsFromFreeText,
} from '../models/packages/package-generate-params.model';

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
    getCountries: async (name?: string) => {
        const { data } = await soccerApiClient.get<{ response: Country[]; errors: string[] }>('/countries', {
            params: { search: name },
        });
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

    getLeaguesByName: async (name: string) => {
        const { data } = await soccerApiClient.get<{
            response: { league: League; country: Country }[];
            errors: string[];
        }>('/leagues', { params: { search: name } });

        if (data.errors.length) throw new Error('Error fetching leagues by name');
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

    getTeamsByName: async (name: string) => {
        const data = await soccerService.getTeamsWithVenueByName(name);

        return data.map((item) => item.team);
    },

    getTeamsWithVenueByName: async (name: string) => {
        const { data } = await soccerApiClient.get<{
            response: { team: Team; venue: Venue }[];
            errors: string[];
        }>('/teams', { params: { search: name } });

        if (data.errors.length) throw new Error('Error searching teams with venue by name');
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

    transformFieldsToActualGenerationParams: async (
        fieldsToTransform: Pick<PackagesGenerationParamsFromFreeText, 'teams' | 'league'>
    ) => {
        const { league, teams } = fieldsToTransform;
        let actualLeague: League | undefined;
        let actualTeams: Team[] | undefined;

        if (league) {
            const actualLeagues = await soccerService.getLeaguesByName(league);

            if (actualLeagues.length > 0) {
                actualLeague = actualLeagues[0].league;
            }
        }

        if (teams) {
            actualTeams = await Promise.all(
                teams.map(async (team) => {
                    try {
                        return soccerService.getTeamsByName(team.name);
                    } catch (error) {
                        console.error(`Error fetching team data for team: ${team.name}`, error);
                        return [];
                    }
                })
            ).then((teams) => teams.flat().slice(0, teams.length));
        }

        const transformedParams: Pick<PackagesGenerationParams, 'teams' | 'league'> = {
            league: actualLeague ? { id: actualLeague.id, name: actualLeague.name } : undefined,
            teams:
                actualTeams && actualTeams.length > 0
                    ? actualTeams.map((team) => ({ id: team.id, name: team.name, logo: team.logo }))
                    : undefined,
        };

        return transformedParams;
    },
};
