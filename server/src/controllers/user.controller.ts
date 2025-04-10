import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { UpdateUserBody } from '../types/user.types';
import { PopulatedSavedPackage, SavedPackage } from '../models/saved-packages.model';
import { HistoryRepository } from '../repositories/history.repository';
import { PopulatedHistory, History } from '../models/history.model';
import mongoose from 'mongoose';
import { populateAggregation } from '../queries/package.query';
import { SavedPackageRepository } from '../repositories/saved-packages.repository';

export const userController = {
    updateUserById: async (req: Request<Record<any, any>, {}, UpdateUserBody>, res: Response) => {
        try {
            const userId = req.params.id;
            const user = await UserRepository.findById(userId);
            if (!user) {
                res.status(404).send({ message: 'User not found' });
                return;
            }

            const updatedUser = await UserRepository.findByIdAndUpdate(userId, req.body, { new: true });
            if (!updatedUser) {
                res.status(404).send({ message: 'User not found' });
                return;
            }
            const { password, refreshTokens, ...publicUser } = updatedUser.toObject();
            res.status(200).send(publicUser);
        } catch (err) {
            res.status(500).send({ message: 'Error updating user', error: err });
        }
    },

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
            const newPackageInHistory: History = await HistoryRepository.create({
                packageId: req.params.packageId,
                userId: req.userId,
            });
            res.status(200).send(newPackageInHistory);
        } catch (err) {
            res.status(500).send(err);
        }
    },

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

    savePackageForUser: async (req: Request, res: Response) => {
        try {
            const savedPackage: SavedPackage = await SavedPackageRepository.create({
                packageId: req.params.packageId,
                userId: req.userId,
            });
            res.status(200).send(savedPackage);
        } catch (err) {
            res.status(500).send(err);
        }
    },

    unsavePackageForUser: async (req: Request, res: Response) => {
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
