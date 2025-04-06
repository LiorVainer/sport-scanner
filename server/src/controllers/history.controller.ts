import { Request, Response } from 'express';
import { HistoryRepository } from '../repositories/history.repository';
import { PackageRepository } from '../repositories/package.repository';
import mongoose from 'mongoose';
import { Package } from '../models/package.model';
import { packageService } from '../services/package.service';

export const historyController = {
    getUsersHistory: async (req: Request, res: Response) => {
        try {
            const packages = await HistoryRepository.aggregate<Package>([
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

    addToUsersHistory: async (req: Request, res: Response) => {
        try {
            const { id, ...rest } = req.body;
            console.log('homo', rest);
            const newPackage = await packageService.createPackage(rest);

            console.log('newPackage', newPackage);
            console.log('packageId', newPackage._id);
            const newPackageInHistory = await HistoryRepository.create({
                packageId: newPackage._id,
                userId: req.userId,
            });
            console.log(newPackageInHistory);
            res.status(200).send(newPackageInHistory);
        } catch (err) {
            res.status(500).send(err);
        }
    },
};
