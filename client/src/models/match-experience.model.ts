import { z } from 'zod';
import { PublicUserSchema } from '@/models/user.model.ts';
import { CommentSchema, CommentWithIdSchema } from '@/models/comment.model.ts';
import { zodDate } from '@/utils/zod.utils.ts';

export const MatchExperiencePayloadSchema = z.object({
    _id: z.string(),
    title: z.string(),
    description: z.string(),
    likes: z.array(z.string()),
    homeTeam: z.string(),
    awayTeam: z.string(),
    matchDate: zodDate,
    league: z.string(),
    country: z.string(),
    stadium: z.string(),
    picture: z.string().optional(),
});

export const MatchExperienceSchema = MatchExperiencePayloadSchema.extend({
    createdAt: zodDate,
    updatedAt: zodDate,
    user: PublicUserSchema,
    comments: z.array(CommentWithIdSchema),
});

export const CreateMatchExperienceSchema = MatchExperiencePayloadSchema.omit({ _id: true, likes: true });

export const PaginatedMatchExperiencesSchema = z.object({
    experiences: z.array(MatchExperienceSchema), 
    totalPages: z.number(), 
});

export type Comment = z.infer<typeof CommentSchema>;
export type MatchExperience = z.infer<typeof MatchExperienceSchema>;

export type CreateMatchExperienceBody = z.infer<typeof CreateMatchExperienceSchema>;
export type PaginatedMatchExperiences = z.infer<typeof PaginatedMatchExperiencesSchema>;

