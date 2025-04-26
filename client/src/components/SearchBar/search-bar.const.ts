import { Team } from '@/models/soccer/soccer.model.ts';

export type DefaultTeam = Omit<Team, 'founded' | 'winner'>;

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

export const MIN_AIRPORT_SEARCH_KEYWORD_LEN = 3;
export const MAX_AIRPORT_SEARCH_KEYWORD_LEN = 50;

export const MIN_COUNTRY_SEARCH_KEYWORD_LEN = 3;

export const TopFootballCountries: string[] = ['Spain', 'England', 'Germany', 'Italy', 'France'];

export const MAX_TEAMS_LIMIT = 5;
