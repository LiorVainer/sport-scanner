import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { Country, League, Team, Venue } from '../types/soccer.types';
import { calculateCurrentSeason } from '../utils/soccer.utils';
import { ENV } from '../env/env.config';

dotenv.config();

export const currSeason = calculateCurrentSeason(new Date());

export const soccerApiClient = axios.create({
    baseURL: 'https://v3.football.api-sports.io',
    headers: {
        'x-apisports-key': ENV.API_KEY || '',
    },
});

export const soccerController = {
    getCountries: async (_req: Request, res: Response) => {
        const response = await soccerApiClient.get('/countries');

        if (response.data.errors.length) {
            res.status(500).json({
                message: 'Error fetching countries',
                error: response.data.errors,
            });
        }

        res.status(200).json(response.data.response as Country[]);
    },

    getLeagues: async (req: Request, res: Response) => {
        const { country } = req.query;

        const response = await soccerApiClient.get('/leagues', {
            params: {
                country,
            },
        });

        if (response.data.errors.length) {
            res.status(500).json({
                message: 'Error fetching leagues',
                error: response.data.errors,
            });
        }

        res.status(200).json(response.data.response as { league: League; country: Country }[]);
    },

    getVenues: async (req: Request, res: Response) => {
        const { country } = req.query;

        const response = await soccerApiClient.get('/venues', {
            params: {
                country,
            },
        });

        if (response.data.errors.length) {
            res.status(500).json({
                message: 'Error fetching venues',
                error: response.data.errors,
            });
        }

        res.status(200).json(response.data.response as Venue[]);
    },

    getTeams: async (req: Request, res: Response) => {
        const { league, season } = req.query;

        const response = await soccerApiClient.get('/teams', {
            params: {
                league,
                season: season || currSeason,
            },
        });

        if (response.data.errors.length) {
            res.status(500).json({
                message: 'Error fetching teams',
                error: response.data.errors,
            });
        }

        res.status(200).json(response.data.response as { team: Team; venue: Venue }[]);
    },
};
