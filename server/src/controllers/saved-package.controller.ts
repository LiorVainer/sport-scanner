import { Request, Response } from 'express';
import { SavedPackageRepository } from '../repositories/saved-packages.repository';
import mongoose from 'mongoose';
import { PopulatedSavedPackage, SavedPackage } from '../models/saved-packages.model';
import { populateAggregation } from '../queries/package.query';

export const savedPackageController = {
    getUsersSavedPackages: async (req: Request, res: Response) => {
        try {
            const { packageId } = req.query;

            const matchStage: Record<string, any> = {
                userId: new mongoose.Types.ObjectId(req.userId),
            };

            if (packageId) {
                matchStage.packageId = new mongoose.Types.ObjectId(packageId as string);
            }

            const packages: PopulatedSavedPackage[] = await SavedPackageRepository.aggregate(
                populateAggregation({ $match: matchStage })
            );
            res.status(200).send(packages);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    addToUsersSavedPackages: async (req: Request, res: Response) => {
        try {
            const savedPackage: SavedPackage = await SavedPackageRepository.create({
                packageId: req.body.packageId,
                userId: req.userId,
            });
            res.status(200).send(savedPackage);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    removeUsersSavedPackage: async (req: Request, res: Response) => {
        try {
            const savedPackage: SavedPackage | null = await SavedPackageRepository.findOneAndDelete({
                packageId: req.params.packageId,
                userId: req.userId,
            });
            res.status(200).send(savedPackage);
        } catch (err) {
            res.status(500).send(err);
        }
    },
};
