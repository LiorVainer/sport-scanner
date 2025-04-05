import { Request, Response } from 'express';
import { PackagesGenerationParams } from '../models/package-generate-params.model';
import { packageService } from '../services/package.service';
import { SavedPackageRepository } from '../repositories/saved-packages.repository';
import { HistoryRepository } from '../repositories/history.repository';

export const packageController = {
    generatePackage: async (req: Request<any, any, PackagesGenerationParams>, res: Response) => {
        const generatedPackage = await packageService.generatePackage(req.body, req.userId);

        res.status(200).send(generatedPackage);
    },

    getSavedPackages: async (req: Request, res: Response) => {
        try {
            const savedPackages = await SavedPackageRepository.find({
                userId: req.userId,
            });
            res.status(200).send(savedPackages);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    getHistory: async (req: Request, res: Response) => {
        try {
            const history = await HistoryRepository.find({
                userId: req.userId,
            });
            res.status(200).send(history);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    savePackage: async (req: Request, res: Response) => {
        try {
            const savedPackage = await SavedPackageRepository.create({
                package: req.body,
                createdBy: req.userId,
            });
            res.status(200).send(savedPackage);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    addToHistory: async (req: Request, res: Response) => {
        try {
            const newPackageInHistory = await HistoryRepository.create({
                package: req.body,
                createdBy: req.userId,
            });
            res.status(200).send(newPackageInHistory);
        } catch (err) {
            res.status(500).send(err);
        }
    },
};
