import { Request, Response } from 'express';
import { PackagesGenerationParams } from '../models/package-generate-params.model';
import { packageService } from '../services/package.service';
import { PackageRepository } from '../repositories/package.repository';

export const packageController = {
    generatePackage: async (req: Request<any, any, PackagesGenerationParams>, res: Response) => {
        const generatedPackage = await packageService.generatePackage(req.body, req.userId);

        res.status(200).send(generatedPackage);
    },

    getById: async (req: Request, res: Response) => {
        const packageId = req.params.id;
        const packageData = await PackageRepository.find({ _id: packageId });

        if (!packageData) {
            res.status(404).send({ message: 'Package not found' });
        }

        res.status(200).send(packageData);
    },
};
