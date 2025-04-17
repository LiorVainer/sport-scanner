import {Request, Response} from 'express';
import {soccerService} from '../services/soccer.service';
import { Country } from '../models/geo.model';

export const soccerController = {
     getCountries: async (req: Request, res: Response): Promise<any> => {
        try {
            const name = req.query.name as string;
            const countries = (await soccerService.getCountries()) ?? [];
            if (name) {
                const regex = new RegExp(name, 'i');
                const filteredCountries = countries.filter((country: Country) => regex.test(country.name));
                return res.status(200).json(filteredCountries);
            }
            return res.status(200).json(countries);
        } catch (e) {
            return res.status(500).json({ message: 'Error fetching countries', error: e });
        }
    },

    getLeagues: async (req: Request, res: Response): Promise<any> => {
        try {
            const country = req.query.country as string;
            const name = req.query.name as string;
            const leagues = await soccerService.getLeaguesByCountry(country);

            if (name && name !== "") {
                const regex = new RegExp(name, 'i');
                const filteredLeagues = leagues.filter((league) => regex.test(league.league.name));
                return res.status(200).json(filteredLeagues);
            }
            res.status(200).json(leagues);
        } catch (e) {
            res.status(500).json({message: 'Error fetching leagues', error: e});
        }
    },

    getVenues: async (req: Request, res: Response) => {
        try {
            const country = req.query.country as string;
            const venues = await soccerService.getVenuesByCountry(country);
            res.status(200).json(venues);
        } catch (e) {
            res.status(500).json({message: 'Error fetching venues', error: e});
        }
    },

    getTeams: async (req: Request, res: Response): Promise<any> => {
        try {
            const league = req.query.league as string;
            const season = req.query.season as string;
            const name = req.query.name as string;
            const teams = await soccerService.getTeamsByLeague(league as string, season as string);

            if (name && name !== "") {
                const regex = new RegExp(name, 'i');
                const filteredTeams = teams.filter((team) => regex.test(team.team.name));
                return res.status(200).json(filteredTeams);
            }
            res.status(200).json(teams);
        } catch (e) {
            res.status(500).json({message: 'Error fetching teams', error: e});
        }
    },
};
