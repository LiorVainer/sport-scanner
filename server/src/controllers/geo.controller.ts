import {Request, Response} from 'express';
import {AmadeusService} from '../services/amadeus.service';
import {CityLocationSchema, CitySearchParams, CitySearchParamsSchema} from '../models/geo.model';
import {soccerService} from '../services/soccer.service';

export const geoController = {
    getCountries: async (_req: Request, res: Response) => {
        try {
            const countries = await soccerService.getCountries();
            res.status(200).json(countries);
        } catch (e) {
            res.status(500).json({message: 'Error fetching countries', error: e});
        }
    },
    getCities: async (req: Request<any, any, CitySearchParams>, res: Response) => {
        const { data: parsedParams, error } = CitySearchParamsSchema.safeParse(req.query);
        if (error) {
          res.status(400).json(error.errors);
          return;
        }
      
        try {
          const cities = await AmadeusService.getCities(parsedParams);
      
          if (!Array.isArray(cities)) {
            res.status(200).json([]);
            return;
          }
      
          const parsedCities = CityLocationSchema.array().parse(cities);
      
          if (parsedParams.withIataCode) {
            const citiesWithIATA = parsedCities.filter((city) => !!city.iataCode);
            res.status(200).send(citiesWithIATA);
          } else {
            res.status(200).send(parsedCities);
          }
        } catch (err) {
          console.error('Failed to fetch or parse cities:', err);
          res.status(500).json({ message: 'Failed to fetch cities', error: err });
        }
      },
};
