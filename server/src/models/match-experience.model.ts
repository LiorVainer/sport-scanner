import { z } from 'zod';
import { StringToObjectId } from '../utils/zod.utils';
import { PopulatedCommentSchema } from './comment.model';
import { PublicUserSchema } from './user.model';

const MatchExperienceSchema = z.object({
    homeTeam: z.string(),
    awayTeam: z.string(),
    matchDate: z.date(),
    league: z.string(),
    country: z.string(),
    stadium: z.string(),
    title: z.string(),
    description: z.string(),
    createdBy: StringToObjectId,
    likes: z.array(StringToObjectId),
    picture: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type MatchExperience = z.infer<typeof MatchExperienceSchema>;

export const MatchExperienceWithId = MatchExperienceSchema.extend({
    _id: StringToObjectId,
});

export const PopulatedMatchExperienceSchema = MatchExperienceSchema.extend({
    createdBy: PublicUserSchema,
    comments: z.array(PopulatedCommentSchema),
});

export type PopulatedMatchExperience = z.infer<typeof PopulatedMatchExperienceSchema>;

export type MatchExperienceWithId = z.infer<typeof MatchExperienceWithId>;

export const MatchExperienceWithoutTimestampsSchema = MatchExperienceSchema.omit({
    createdAt: true,
    updatedAt: true,
});

export const MatchExperiencePayloadSchema = MatchExperienceWithoutTimestampsSchema.omit({
    likes: true,
    createdBy: true,
});

export type MatchExperiencePayload = z.infer<typeof MatchExperiencePayloadSchema>;

export const MatchExperienceWithUserAndCommentsIdsSchema = MatchExperienceSchema.extend({
    createdBy: PublicUserSchema,
    comments: z.array(StringToObjectId),
});

export type MatchExperienceWithUserAndCommentsIds = z.infer<typeof MatchExperienceWithUserAndCommentsIdsSchema>;
