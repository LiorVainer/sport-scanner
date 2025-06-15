import { Team } from '@/models/soccer/soccer.model.ts';

export type DefaultTeam = Omit<Team, 'founded' | 'winner'>;

export interface DefaultCountry {
    name: string;
    code: string;
    flag: string;
}

export const DEFAULT_TEAMS: DefaultTeam[] = [
    {
        id: 541,
        name: 'Real Madrid',
        code: 'REA',
        country: 'Spain',
        logo: 'https://media.api-sports.io/football/teams/541.png',
        national: false,
    },
    {
        id: 529,
        name: 'Barcelona',
        code: 'BAR',
        country: 'Spain',
        logo: 'https://media.api-sports.io/football/teams/529.png',
        national: false,
    },
    {
        id: 50,
        name: 'Manchester City',
        code: 'MAC',
        country: 'England',
        logo: 'https://media.api-sports.io/football/teams/50.png',
        national: false,
    },
    {
        id: 489,
        name: 'AC Milan',
        code: 'MIL',
        country: 'Italy',
        logo: 'https://media.api-sports.io/football/teams/489.png',
        national: false,
    },
    {
        id: 492,
        name: 'Napoli',
        code: 'NAP',
        country: 'Italy',
        logo: 'https://media.api-sports.io/football/teams/492.png',
        national: false,
    },
];

export const MIN_SEARCH_KEYWORD_LEN = 3;
export const MAX_AIRPORT_SEARCH_KEYWORD_LEN = 50;

export const MIN_COUNTRY_SEARCH_KEYWORD_LEN = 3;

export const TopFootballCountries: string[] = ['Spain', 'England', 'Germany', 'Italy', 'France'];
export const DEFAULT_COUNTRIES: DefaultCountry[] = [
    {
        name: 'Spain',
        code: 'ES',
        flag: 'https://media.api-sports.io/flags/es.svg',
    },
    {
        name: 'England',
        code: 'GB',
        flag: 'https://media.api-sports.io/flags/gb.svg',
    },
    {
        name: 'Germany',
        code: 'DE',
        flag: 'https://media.api-sports.io/flags/de.svg',
    },
    {
        name: 'Italy',
        code: 'IT',
        flag: 'https://media.api-sports.io/flags/it.svg',
    },
    {
        name: 'France',
        code: 'FR',
        flag: 'https://media.api-sports.io/flags/fr.svg',
    },
];

export const MAX_TEAMS_LIMIT = 5;

export const MIN_PRICE = 100;
export const MAX_PRICE = 20000;
export const DEFAULT_MAX_PRICE = 1000;
