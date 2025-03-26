import { PopulatedMatchExperience } from '../models/match-experience.model';
import { MatchExperienceRepository } from '../repositories/match-experience.repository';
import mongoose, { PipelineStage } from 'mongoose';
import {
    likesCountQuery,
    lookupComments,
    lookupCommentUsers,
    lookupCreatedByToUser,
    mapUsersToComments,
    projectCommentUsersFields,
    projectUserFields,
    sortComments,
    unwindUser,
} from '../queries/match-experience.query';

class MatchExperienceService {
    getMatchExperienceById = async (id: string) => {
        try {
            const result = await MatchExperienceRepository.aggregate<PopulatedMatchExperience>([
                { $match: { _id: new mongoose.Types.ObjectId(id) } },
                lookupCreatedByToUser,
                unwindUser,
                projectUserFields,
                lookupComments,
                sortComments,
                lookupCommentUsers,
                mapUsersToComments,
                projectCommentUsersFields,
            ]);

            return result.at(0) || null;
        } catch (error) {
            console.error(`Error fetching matchExperience with ID ${id}:`, error);
            throw error;
        }
    };

    getAllMatchExperiences = async (page: number, limit: number, sortBy: string = 'date') => {
        try {
            const totalExperiences = await MatchExperienceRepository.countDocuments();

            let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };

            if (sortBy === 'likes') {
                sortQuery = { likesCount: -1 };
            }

            const experiences = await MatchExperienceRepository.aggregate<PipelineStage[]>([
                lookupCreatedByToUser,
                unwindUser,
                projectUserFields,
                lookupComments,
                sortComments,
                lookupCommentUsers,
                mapUsersToComments,
                projectCommentUsersFields,
                likesCountQuery,
                { $sort: sortQuery },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ]);

            return {
                experiences,
                totalPages: Math.ceil(totalExperiences / limit),
            };
        } catch (error) {
            console.error('Error fetching match experiences:', error);
            throw error;
        }
    };

    getAllMatchExperiencesByUserId = async (userId: string, page: number, limit: number, sortBy: string = 'date') => {
        try {
            const totalExperiences = await MatchExperienceRepository.countDocuments({ createdBy: userId });

            let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };

            if (sortBy === 'likes') {
                sortQuery = { likesCount: -1 };
            }

            const experiences = await MatchExperienceRepository.aggregate<PipelineStage[]>([
                { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
                lookupCreatedByToUser,
                unwindUser,
                projectUserFields,
                lookupComments,
                sortComments,
                lookupCommentUsers,
                mapUsersToComments,
                projectCommentUsersFields,
                likesCountQuery,
                { $sort: sortQuery },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ]);

            return {
                experiences,
                totalPages: Math.ceil(totalExperiences / limit),
            };
        } catch (error) {
            console.error(`Error fetching match experiences for user ${userId}:`, error);
            throw error;
        }
    };
}

export const matchExperienceService = new MatchExperienceService();
