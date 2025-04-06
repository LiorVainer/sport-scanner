import { Request, Response } from 'express';
import { SavedPackageRepository } from '../repositories/saved-packages.repository';
import { Package } from '../models/package.model';
import mongoose from 'mongoose';

export const savedPackageController = {
    getUsersSavedPackages: async (req: Request, res: Response) => {
        try {
            const packages = await SavedPackageRepository.aggregate<Package>([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(req.userId),
                    },
                },
                {
                    $lookup: {
                        from: 'packages',
                        localField: 'packageId',
                        foreignField: '_id',
                        as: 'package',
                    },
                },
                {
                    $unwind: '$package',
                },
                { $replaceRoot: { newRoot: '$package' } },
            ]);
            res.status(200).send(packages);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    addToUsersSavedPackages: async (req: Request, res: Response) => {
        try {
            const savedPackage = await SavedPackageRepository.create({
                packageId: req.body.packageId,
                userId: req.userId,
            });
            res.status(200).send(savedPackage);
        } catch (err) {
            res.status(500).send(err);
        }
    },
};
