import { Request, Response } from 'express';
import { soccerService } from '../services/soccer.service';
import { PackageGenerateParamsSchema } from '../models/package-generate-params.model';

export const soccerController = {
    getCountries: async (_req: Request, res: Response) => {
        try {
            const countries = await soccerService.getCountries();
            res.status(200).json(countries);
        } catch (e) {
            res.status(500).json({ message: 'Error fetching countries', error: e });
        }
    },

    getLeagues: async (req: Request, res: Response) => {
        try {
            const country = req.query.country as string;
            const leagues = await soccerService.getLeaguesByCountry(country);
            res.status(200).json(leagues);
        } catch (e) {
            res.status(500).json({ message: 'Error fetching leagues', error: e });
        }
    },

    getVenues: async (req: Request, res: Response) => {
        try {
            const country = req.query.country as string;
            const venues = await soccerService.getVenuesByCountry(country);
            res.status(200).json(venues);
        } catch (e) {
            res.status(500).json({ message: 'Error fetching venues', error: e });
        }
    },

    getTeams: async (req: Request, res: Response) => {
        try {
            const { league, season } = req.query;
            const teams = await soccerService.getTeamsByLeague(league as string, season as string);
            res.status(200).json(teams);
        } catch (e) {
            res.status(500).json({ message: 'Error fetching teams', error: e });
        }
    },
};
