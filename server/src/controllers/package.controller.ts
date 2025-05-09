import { Request, Response } from 'express';
import { PackageRepository } from '../repositories/package.repository';
import {
    PackagesGenerationParams,
    PackagesGenerationParamsSchema,
} from '../models/packages/package-generate-params.model';
import { packageService } from '../services/package.service';
import { PackagesGenerationProgressUpdate } from '../models/packages/package-generation-progress-update.model';

export const packageController = {
    generatePackages: async (req: Request<any, any, PackagesGenerationParams>, res: Response) => {
        const { data: validatedBody, error } = PackagesGenerationParamsSchema.safeParse(req.body);
        if (error) {
            res.status(400).send({ message: 'Invalid request body', error });
            return;
        }

        const generatedPackage = await packageService.generatePackages({ searchParams: validatedBody });

        res.status(200).send(generatedPackage);
    },
    streamPackageGeneration: async (req: Request<any, any, PackagesGenerationParams>, res: Response) => {
        const { data: validatedBody, error } = PackagesGenerationParamsSchema.safeParse(req.body);
        if (error) {
            res.status(400).send({ message: 'Invalid request body', error });
            return;
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const emit = (event: PackagesGenerationProgressUpdate) => {
            res.write(`data: ${JSON.stringify(event)}\n\n`);
        };

        await packageService.generatePackages({ searchParams: validatedBody, emit });

        res.end();
    },
    getById: async (req: Request, res: Response) => {
        const packageId = req.params.id;
        const [packageData] = await PackageRepository.find({ _id: packageId });

        if (!packageData) {
            res.status(404).send({ message: 'Package not found' });
        }

        res.status(200).send(packageData);
    },

    createPackage: async (req: Request, res: Response) => {
        const { id, ...rest } = req.body;

        try {
            const newPackage = await PackageRepository.create(rest);
            res.status(200).send(newPackage);
        } catch (err) {
            res.status(500).send(err);
        }
    },
};
