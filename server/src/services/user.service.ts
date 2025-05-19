import { UpdateUserBody } from '../types/user.types';
import { UserRepository } from '../repositories/user.repository';
import { History, PopulatedHistory } from '../models/history.model';
import { PopulatedSavedPackage, SavedPackage } from '../models/saved-packages.model';
import { HistoryRepository } from '../repositories/history.repository';
import { SavedPackageRepository } from '../repositories/saved-packages.repository';
import mongoose from 'mongoose';
import { populateAggregation } from '../queries/package.query';
import { User } from '../models/user.model';

export const UserService = {
    async updateUserById(userId: string, data: UpdateUserBody): Promise<User | null> {
        const user = await UserRepository.findById(userId);
        if (!user) return null;

        const updatedUser = await UserRepository.findByIdAndUpdate(userId, data, { new: true });
        return updatedUser ? updatedUser.toObject() : null;
    },

    async getUsersHistory(userId: string): Promise<PopulatedHistory[]> {
        const matchStage = {
            $match: { userId: new mongoose.Types.ObjectId(userId) },
        };

        return HistoryRepository.aggregate(populateAggregation(matchStage));
    },

    async addToUsersHistory(userId: string, packageId: string): Promise<History> {
        return await HistoryRepository.create({
            packageId,
            userId,
        });
    },

    async getUsersSavedPackages(userId: string, packageId?: string): Promise<PopulatedSavedPackage[]> {
        const matchStage: Record<string, any> = {
            userId: new mongoose.Types.ObjectId(userId),
        };

        if (packageId) {
            matchStage.packageId = new mongoose.Types.ObjectId(packageId);
        }

        return SavedPackageRepository.aggregate(populateAggregation({ $match: matchStage }));
    },

    async savePackage(userId: string, packageId: string): Promise<SavedPackage> {
        return await SavedPackageRepository.create({ userId, packageId });
    },

    async unsavePackage(userId: string, packageId: string): Promise<SavedPackage | null> {
        return SavedPackageRepository.findOneAndDelete({ userId, packageId });
    },

    async getSuggestedPackages(userId: string) {
        return UserRepository.findById(userId).populate('suggestedPackages').select('suggestedPackages').lean();
    },
};
