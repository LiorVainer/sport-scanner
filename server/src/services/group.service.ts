import mongoose from 'mongoose';
import { CreateGroupPayload, Group, UpdateGroupPayloadSchema } from '../models/group.model';
import { GroupRepository } from '../repositories/group.repository';
import { packageService } from './package.service';
import { PackageRepository } from '../repositories/package.repository';
import { PublicUser } from '../models/user.model';
import { PackagesGenerationParams } from '../models/packages/package-generate-params.model';

export const GroupService = {
    async createGroup(groupData: CreateGroupPayload, userId?: string) {
        try {
            const { users } = groupData;

            if (!users.includes(new mongoose.Types.ObjectId(userId))) {
                users.push(new mongoose.Types.ObjectId(userId));
            }

            const newGroup = await GroupRepository.create({
                ...groupData,
                createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
            });
            const populatedGroup = await GroupRepository.findById(newGroup._id)
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
                .populate('createdBy')
                .lean();

            if (!populatedGroup) {
                throw new Error('Failed to create and retrieve group');
            }

            return populatedGroup;
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    },

    async getGroupById(id: string) {
        try {
            const group = await GroupRepository.findById(id)
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
                .populate('createdBy')
                .lean();

            if (!group) return null;
            return group;
        } catch (error) {
            console.error(`Error fetching group with ID ${id}:`, error);
            throw error;
        }
    },

    async getGroupsByUserId(userId: string) {
        try {
            return await GroupRepository.find({
                $or: [
                    { createdBy: new mongoose.Types.ObjectId(userId) },
                    { users: new mongoose.Types.ObjectId(userId) },
                ],
            })
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
                .populate('createdBy')
                .sort({ updatedAt: -1 })
                .lean();
        } catch (error) {
            console.error(`Error fetching groups for user ${userId}:`, error);
            throw error;
        }
    },

    async updateGroup(id: string, updateData: Partial<Group>, userId?: string) {
        try {
            const { data: parsedBody, error } = UpdateGroupPayloadSchema.safeParse(updateData);
            if (error) {
                throw new Error(`Invalid update data: ${error.message}`);
            }

            const { users } = parsedBody;
            if (users && !users.includes(new mongoose.Types.ObjectId(userId))) {
                users.push(new mongoose.Types.ObjectId(userId));
            }

            const updatedGroup = await GroupRepository.findByIdAndUpdate(id, parsedBody, {
                new: true,
            })
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
                .populate('createdBy')
                .lean();

            if (!updatedGroup) return null;
            return updatedGroup;
        } catch (error) {
            console.error(`Error updating group with ID ${id}:`, error);
            throw error;
        }
    },

    async deleteGroup(id: string): Promise<boolean> {
        try {
            const result = await GroupRepository.findByIdAndDelete(id);
            return result !== null;
        } catch (error) {
            console.error(`Error deleting group with ID ${id}:`, error);
            throw error;
        }
    },

    async setPackageForGroup(groupId: string, packageId: string) {
        try {
            const updatedGroup = await GroupRepository.findByIdAndUpdate(
                groupId,
                { selectedPackage: new mongoose.Types.ObjectId(packageId) },
                { new: true }
            )
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
                .populate('createdBy')
                .lean();

            if (!updatedGroup) return null;
            return updatedGroup;
        } catch (error) {
            console.error(`Error setting package ${packageId} for group ${groupId}:`, error);
            throw error;
        }
    },

    async getGroupsByPackageId(packageId: string) {
        try {
            return await GroupRepository.find({ selectedPackage: new mongoose.Types.ObjectId(packageId) })
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
                .populate('createdBy')
                .lean();
        } catch (error) {
            console.error(`Error fetching groups for package ${packageId}:`, error);
            throw error;
        }
    },

    async removePackageFromGroup(groupId: string) {
        try {
            const updatedGroup = await GroupRepository.findByIdAndUpdate(
                groupId,
                { $unset: { selectedPackage: 1 } },
                { new: true }
            )
                .populate('users')
                .populate('suggestedPackages')
                .populate('createdBy')
                .lean();

            if (!updatedGroup) return null;
            return updatedGroup;
        } catch (error) {
            console.error(`Error removing package from group ${groupId}:`, error);
            throw error;
        }
    },

    async addSuggestedPackage(groupId: string, packageId: string) {
        try {
            const updatedGroup = await GroupRepository.findByIdAndUpdate(
                groupId,
                { $addToSet: { suggestedPackages: new mongoose.Types.ObjectId(packageId) } },
                { new: true }
            )
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
                .populate('createdBy')
                .lean();

            if (!updatedGroup) return null;
            return updatedGroup;
        } catch (error) {
            console.error(`Error adding suggested package ${packageId} to group ${groupId}:`, error);
            throw error;
        }
    },

    async removeSuggestedPackage(groupId: string, packageId: string) {
        try {
            const updatedGroup = await GroupRepository.findByIdAndUpdate(
                groupId,
                { $pull: { suggestedPackages: new mongoose.Types.ObjectId(packageId) } },
                { new: true }
            )
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
                .populate('createdBy')
                .lean();

            if (!updatedGroup) return null;
            return updatedGroup;
        } catch (error) {
            console.error(`Error removing suggested package ${packageId} from group ${groupId}:`, error);
            throw error;
        }
    },

    async voteForPackage(groupId: string, userId: string, packageId: string) {
        const voteKey = `suggestedPackagesVotes.${userId}`;
        const voted = await GroupRepository.findByIdAndUpdate(
            groupId,
            { $set: { [voteKey]: new mongoose.Types.ObjectId(packageId) } },
            { new: true }
        ).lean();
        if (!voted) return null;

        const votesMap = voted.suggestedPackagesVotes ?? {};
        const counts: Record<string, number> = {};
        Object.values(votesMap).forEach((pkgOid) => {
            const idStr = pkgOid.toString();
            counts[idStr] = (counts[idStr] || 0) + 1;
        });

        const winnerId = Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .map(([id]) => id)[0];

        const updated = await GroupRepository.findByIdAndUpdate(
            groupId,
            { selectedPackage: winnerId ? new mongoose.Types.ObjectId(winnerId) : undefined },
            { new: true }
        )
            .populate('users')
            .populate('selectedPackage')
            .populate('suggestedPackages')
            .populate('createdBy')
            .lean();

        return updated;
    },

    async unVoteForPackage(groupId: string, userId: string) {
        // 1. remove the vote
        const voteKey = `suggestedPackagesVotes.${userId}`;
        const unvoted = await GroupRepository.findByIdAndUpdate(
            groupId,
            { $unset: { [voteKey]: '' } },
            { new: true }
        ).lean();
        if (!unvoted) return null;

        // 2. recompute winner (same logic as above)
        const votesMap = unvoted.suggestedPackagesVotes ?? {};
        const counts: Record<string, number> = {};
        Object.values(votesMap).forEach((pkgOid) => {
            const idStr = pkgOid.toString();
            counts[idStr] = (counts[idStr] || 0) + 1;
        });
        const entries = Object.entries(counts);
        const winnerId = entries.length > 0 ? entries.sort(([, a], [, b]) => b - a)[0][0] : null;

        let updateOperation;
        if (winnerId) {
            updateOperation = { selectedPackage: new mongoose.Types.ObjectId(winnerId) };
        } else {
            updateOperation = { $unset: { selectedPackage: 1 } };
        }

        const updated = await GroupRepository.findByIdAndUpdate(groupId, updateOperation, { new: true })
            .populate('users')
            .populate('selectedPackage')
            .populate('suggestedPackages')
            .populate('createdBy')
            .lean();
        return updated;
    },

    async generateSuggestedPackagesForGroup(groupId: string) {
        try {
            const group = await GroupRepository.findById(groupId).populate('users').lean();

            if (!group) {
                console.error(`Group ${groupId} not found`);
                return null;
            }

            const groupUsers = group.users as unknown as PublicUser[];

            if (!groupUsers.length) {
                console.error(`No users found for group ${groupId}`);
                return null;
            }

            const allFavoriteTeams = groupUsers.flatMap((user) => user.favoriteTeams || []);

            const userWithHomeAirport = groupUsers.find((user) => user.homeAirport);
            const originIATA = userWithHomeAirport?.homeAirport?.iataCode || 'TLV';

            if (allFavoriteTeams.length === 0) {
                console.error(`No favorite teams found for users in group ${groupId}`);
                return null;
            }

            const searchParams: PackagesGenerationParams = {
                teams: allFavoriteTeams.map((team) => ({ id: team.id, name: team.name })),
                originIATA,
                date: {
                    from: group.dates.start,
                    to: group.dates.end,
                },
                price: {
                    min: 0,
                    max: group.maxBudget,
                },
            };

            const generatedPackages = await packageService.generatePackages({
                searchParams,
                maxAmountOfPackages: 3,
            });

            if (!generatedPackages || generatedPackages.length === 0) {
                console.error(`No packages generated for group ${groupId}`);
                return null;
            }

            const savedPackages = await PackageRepository.insertMany(generatedPackages);
            const packageIds = savedPackages.map((pkg) => pkg._id);

            return await GroupRepository.findByIdAndUpdate(groupId, { suggestedPackages: packageIds }, { new: true })
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
                .populate('createdBy')
                .lean();
        } catch (error) {
            console.error(`Error generating packages for group ${groupId}:`, error);
            throw error;
        }
    },
};
