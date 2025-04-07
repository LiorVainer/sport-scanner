import { Request, Response } from 'express';
import { HistoryRepository } from '../repositories/history.repository';
import mongoose from 'mongoose';
import { packageService } from '../services/package.service';

export const historyController = {
    getUsersHistory: async (req: Request, res: Response) => {
        try {
            const pipeline: mongoose.PipelineStage[] = [
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
                { $unwind: '$package' },
                {
                    $sort: { package: -1 },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%d/%m/%Y', date: '$createdAt' },
                        },
                        packages: { $push: '$package' },
                    },
                },
                {
                    $sort: { _id: -1 },
                },
            ];

            const packages = await HistoryRepository.aggregate(pipeline);
            res.status(200).send(packages);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    addToUsersHistory: async (req: Request, res: Response) => {
        try {
            const { id, ...rest } = req.body;
            const newPackage = await packageService.createPackage(rest);

            const newPackageInHistory = await HistoryRepository.create({
                packageId: newPackage._id,
                userId: req.userId,
            });
            res.status(200).send(newPackageInHistory);
        } catch (err) {
            res.status(500).send(err);
        }
    },
};
