import { Request, Response } from 'express';
import { HistoryRepository } from '../repositories/history.repository';
import mongoose from 'mongoose';
import { packageService } from '../services/package.service';
import { History, PopulatedHistory } from '../models/history.model';
import { populateAggregation } from '../queries/package.query';

export const historyController = {
    getUsersHistory: async (req: Request, res: Response) => {
        try {
            const matchStage = {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.userId),
                },
            };

            const packages: PopulatedHistory[] = await HistoryRepository.aggregate(populateAggregation(matchStage));
            res.status(200).send(packages);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    addToUsersHistory: async (req: Request, res: Response) => {
        try {
            const { id, ...rest } = req.body;
            const newPackage = await packageService.createPackage(rest);

            const newPackageInHistory: History = await HistoryRepository.create({
                packageId: newPackage._id,
                userId: req.userId,
            });
            res.status(200).send(newPackageInHistory);
        } catch (err) {
            res.status(500).send(err);
        }
    },
};
