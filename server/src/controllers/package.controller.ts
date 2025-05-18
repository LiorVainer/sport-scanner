import { Request, Response } from 'express';
import { PackageRepository } from '../repositories/package.repository';
import {
    PackagesGenerationParams,
    PackagesGenerationParamsSchema,
    PackagesGenerationParamsWithStringDatesAndFreeText,
} from '../models/packages/package-generate-params.model';
import { packageService } from '../services/package.service';
import { PackagesGenerationProgressUpdate } from '../models/packages/package-generation-progress-update.model';
import { packagesLogger } from '../logs/packages.logger';

export const packageController = {
    generatePackages: async (req: Request<any, any, PackagesGenerationParams>, res: Response) => {
        const { data: validatedBody, error } = PackagesGenerationParamsSchema.safeParse(req.body);
        if (error) {
            res.status(400).send({ message: 'Invalid request body', error });
            return;
        }

        const generatedPackage = await packageService.generatePackage(validatedBody);

        res.status(200).send(generatedPackage);
    },

    streamPackageGeneration: async (
        req: Request<any, any, PackagesGenerationParamsWithStringDatesAndFreeText>,
        res: Response
    ) => {
        const { freeText, ...initialParams } = req.body;
        let params = initialParams;
        if (freeText) {
            packagesLogger.info(`💬 Received free text input: ${freeText}`);
            params = await packageService.transformFreeTextIntoPackagesGenerationParams(freeText);
            packagesLogger.info(`✨ Transform the free text input into: ${JSON.stringify(params)}`);
        }

        const { data: validatedBody, error } = PackagesGenerationParamsSchema.safeParse(params);

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

        await packageService.generatePackage(validatedBody, emit);

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
