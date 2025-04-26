import { Request, Response } from 'express';
import { soccerService } from '../services/soccer.service';
import { MINIMUM_COUNTRY_SEARCH_NAME_LENGTH } from '../constants/soccer.const';

export const soccerController = {
    getCountries: async (req: Request, res: Response) => {
        try {
            const name = req.query.name as string;

            if (name && name.length < MINIMUM_COUNTRY_SEARCH_NAME_LENGTH) {
                res.status(400).json({
                    message: `Country name must be at least ${MINIMUM_COUNTRY_SEARCH_NAME_LENGTH} characters long.`,
                });
                return;
            }

            const countries = (await soccerService.getCountries(name)) ?? [];

            return res.status(200).json(countries);
        } catch (e) {
            return res.status(500).json({ message: 'Error fetching countries', error: e });
        }
    },

    getLeagues: async (req: Request, res: Response) => {
        try {
            const country = req.query.country as string;
            const leagueName = req.query.name as string;

            const leagues = await soccerService.getLeaguesByCountry(country);

            if (leagueName && leagueName !== '') {
                const regex = new RegExp(leagueName, 'i');
                const filteredLeagues = leagues.filter((league) => regex.test(league.league.name));
                res.status(200).json(filteredLeagues);
                return;
            }

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
            const name = req.query.name as string | undefined;
            const include = req.query.include as string | undefined;

            const withVenue = include === 'venue';

            if (!name || name.length < 3) {
                res.status(400).json({ message: 'Team name is required and must be at least 3 characters long.' });
                return;
            }

            if (withVenue) {
                const teams = await soccerService.getTeamsWithVenueByName(name);
                res.status(200).json(teams);
                return;
            }

            const teams = await soccerService.getTeamsByName(name);
            res.status(200).json(teams);
        } catch (e) {
            res.status(500).json({ message: 'Error fetching teams', error: e });
        }
    },
};
