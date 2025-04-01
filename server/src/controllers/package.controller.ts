import {Request, Response} from 'express';
import {PackageGenerateParams} from "../models/package-generate-params.model";
import {packageService} from "../services/package.service";


export const packageController = {
    generatePackage: async (req: Request<any, any, PackageGenerateParams>, res: Response) => {
        const generatedPackage = await packageService.generatePackage(req.body, req.userId);

        res.status(200).send(generatedPackage);
    }
};
