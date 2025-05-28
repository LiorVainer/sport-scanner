import mongoose from 'mongoose';
import { CreateGroupPayload, Group } from '../models/group.model';
import { GroupRepository } from '../repositories/group.repository';

export const GroupService = {
    async createGroup(groupData: CreateGroupPayload) {
        try {
            const newGroup = await GroupRepository.create(groupData);
            const populatedGroup = await GroupRepository.findById(newGroup._id)
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
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
            return await GroupRepository.find({ users: new mongoose.Types.ObjectId(userId) })
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
                .lean();
        } catch (error) {
            console.error(`Error fetching groups for user ${userId}:`, error);
            throw error;
        }
    },

    async updateGroup(id: string, updateData: Partial<Group>) {
        try {
            const updatedGroup = await GroupRepository.findByIdAndUpdate(id, updateData, { new: true })
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
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
                .lean();

            if (!updatedGroup) return null;
            return updatedGroup;
        } catch (error) {
            console.error(`Error removing suggested package ${packageId} from group ${groupId}:`, error);
            throw error;
        }
    },

    async voteForPackage(groupId: string, userId: string, packageId: string) {
        try {
            // Create a properly typed update object for MongoDB
            const updateKey = `suggestedPackagesVotes.${userId}`;
            const updateValue = new mongoose.Types.ObjectId(packageId);

            // Use MongoDB's dot notation in a type-safe way
            const updateOperation = { $set: { [updateKey]: updateValue } };

            const updatedGroup = await GroupRepository.findByIdAndUpdate(groupId, updateOperation, { new: true })
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
                .lean();

            if (!updatedGroup) return null;
            return updatedGroup;
        } catch (error) {
            console.error(`Error voting for package ${packageId} by user ${userId} in group ${groupId}:`, error);
            throw error;
        }
    },

    async removeVote(groupId: string, userId: string) {
        try {
            const updateKey = `suggestedPackagesVotes.${userId}`;
            const updateOperation = { $unset: { [updateKey]: 1 } };

            const updatedGroup = await GroupRepository.findByIdAndUpdate(groupId, updateOperation, { new: true })
                .populate('users')
                .populate('selectedPackage')
                .populate('suggestedPackages')
                .lean();

            if (!updatedGroup) return null;
            return updatedGroup;
        } catch (error) {
            console.error(`Error removing vote for user ${userId} in group ${groupId}:`, error);
            throw error;
        }
    },
};
