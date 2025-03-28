import dotenv from 'dotenv';
import {Request, Response} from 'express';
import {PackageGenerateParams} from "../models/package-generate-params.model";
import {packageService} from "../services/package.service";

dotenv.config();

export const packageController = {
    generatePackage: async (req: Request<any, any, PackageGenerateParams>, res: Response) => {
        const result = await packageService.generatePackage(req.body);

        res.status(200).send(result);
    }
};
