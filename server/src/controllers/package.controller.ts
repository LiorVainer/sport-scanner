import dotenv from 'dotenv';
import { Request, Response } from 'express';
import {PackageSearchFilters} from "../models/package-search-filters.model";
import {packageService} from "../services/package.service";

dotenv.config();

export const packageController = {
   generatePackage: async (req: Request<any, any, PackageSearchFilters>, res: Response) => {
       const result  = packageService.generatePackage(req.body);

       res.status(200).send(result);
   }
};
