import { UpdateUserBody } from '../types/user.types';
import { UserRepository } from '../repositories/user.repository';
import { History, PopulatedHistory } from '../models/history.model';
import { PopulatedSavedPackage, SavedPackage } from '../models/saved-packages.model';
import { HistoryRepository } from '../repositories/history.repository';
import { SavedPackageRepository } from '../repositories/saved-packages.repository';
import mongoose from 'mongoose';
import { populateAggregation } from '../queries/package.query';
import { User } from '../models/user.model';
import { packageService } from './package.service';
import { PackageRepository } from '../repositories/package.repository';
import { ENV } from '../env/env.config';
import {
    InnerPackagesGenerationParamsSchema,
    PackagesGenerationParams,
} from '../models/packages/package-generate-params.model';
import moment from 'moment';

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
        await HistoryRepository.deleteMany({ userId, packageId });

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

    async getUsers(username?: string): Promise<User[]> {
        const filter = username ? { username: { $regex: username, $options: 'i' } } : {};
        return await UserRepository.find(filter).select('username _id');
    },

    async generateSuggestedPackagesForUser(userId: string): Promise<{
        success: boolean;
        message: string;
        packageCount?: number;
    }> {
        try {
            const user = await UserRepository.findById(userId).lean();

            if (!user) {
                return { success: false, message: 'User not found' };
            }

            if ((user.favoriteTeams.length === 0 && user.favoriteLeagues.length === 0) || !user.homeAirport) {
                return {
                    success: false,
                    message: 'User is missing required preferences (favorite teams/leagues or home airport)',
                };
            }

            const MAX_PACKAGES_PER_USER = ENV?.USER_SUGGESTED_PACKAGES_GENERATION_MAX_PACKAGES_PER_USER;
            const MAX_PRICE = ENV.USER_SUGGESTED_PACKAGES_GENERATION_MAX_PRICE;
            const MAX_PACKAGES_PER_USER_WITH_OFFSET =
                ENV.USER_SUGGESTED_PACKAGES_GENERATION_MAX_PACKAGES_PER_USER +
                ENV.USER_SUGGESTED_PACKAGES_GENERATION_MAX_PACKAGES_OFFSET;

            const startDate = moment()
                .add(ENV.USER_SUGGESTED_PACKAGES_GENERATION_START_DATE_OFFSET, 'days')
                .startOf('day');

            const endDate = moment().add(ENV.USER_SUGGESTED_PACKAGES_GENERATION_END_DATE_OFFSET, 'days').endOf('day');

            const searchParams: PackagesGenerationParams = {
                originIATA: user.homeAirport.iataCode,
                price: { min: 0, max: MAX_PRICE },
                league:
                    user.favoriteLeagues.length > 0
                        ? {
                              id: user.favoriteLeagues[0].id,
                              name: user.favoriteLeagues[0].name,
                          }
                        : undefined,
                teams: user.favoriteTeams.map((team) => ({
                    id: team.id,
                    name: team.name,
                })),
                date: {
                    from: startDate.toDate(),
                    to: endDate.toDate(),
                },
            };

            try {
                InnerPackagesGenerationParamsSchema.parse(searchParams);
            } catch (error) {
                return { success: false, message: 'Invalid search parameters' };
            }

            let generatedPackages = await packageService.generatePackages({
                searchParams,
                maxAmountOfPackages: MAX_PACKAGES_PER_USER_WITH_OFFSET,
            });

            if (generatedPackages.length > MAX_PACKAGES_PER_USER) {
                generatedPackages = generatedPackages.slice(0, MAX_PACKAGES_PER_USER);
            }

            if (generatedPackages.length === 0) {
                return { success: false, message: 'No packages could be generated for your preferences' };
            }

            const savedPackages = await PackageRepository.insertMany(generatedPackages);

            await UserRepository.updateOne(
                { _id: user._id },
                {
                    $set: { suggestedPackages: savedPackages.map((pkg) => pkg._id.toString()) },
                }
            );

            return {
                success: true,
                message: 'Successfully generated new suggested packages',
                packageCount: savedPackages.length,
            };
        } catch (error) {
            console.error('Error generating suggested packages for user:', error);
            return { success: false, message: 'Failed to generate suggested packages' };
        }
    },
};
