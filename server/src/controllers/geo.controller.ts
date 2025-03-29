import { Request, Response } from 'express';
import { PackageGenerateParams } from '../models/package-generate-params.model';
import { packageService } from '../services/package.service';
import { AmadeusService } from '../services/amadeus.service';
import { Country } from '../models/soccer.model';
import { CitySearchParams, CitySearchParamsSchema } from '../models/geo.model';
import { soccerService } from '../services/soccer.service';

export const geoController = {
    getCountries: async (_req: Request, res: Response) => {
        try {
            const countries = await soccerService.getCountries();
            res.status(200).json(countries);
        } catch (e) {
            res.status(500).json({ message: 'Error fetching countries', error: e });
        }
    },
    getCities: async (req: Request<any, any, CitySearchParams>, res: Response) => {
        const { data: parsedParams, error } = CitySearchParamsSchema.safeParse(req.query);
        if (error) {
            res.status(400).json(error.errors);
            return;
        }

        const result = await AmadeusService.getCities(parsedParams);

        res.status(200).send(result);
    },
};
