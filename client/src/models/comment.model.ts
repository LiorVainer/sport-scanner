import { z } from 'zod';
import { PublicUserSchema } from './user.model';
import { zodDate } from '@/utils/zod.utils.ts';

export const CommentSchema = z.object({
    matchExperienceId: z.string(),
    userId: z.string(),
    content: z.string(),
    createdAt: zodDate,
    updatedAt: zodDate,
    user: PublicUserSchema,
});

export type Comment = z.infer<typeof CommentSchema>;

export const CommentWithIdSchema = CommentSchema.extend({
    _id: z.string(),
});

export type CommentWithId = z.infer<typeof CommentWithIdSchema>;

export const CreateCommentDTOSchema = CommentSchema.omit({
    createdAt: true,
    updatedAt: true,
});

export type CreateCommentDTO = z.infer<typeof CreateCommentDTOSchema>;
