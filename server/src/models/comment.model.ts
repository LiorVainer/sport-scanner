import { z } from 'zod';
import { StringToObjectId } from '../utils/zod.utils';
import { UserWithIdSchema } from './user.model';

export const CommentSchema = z.object({
    matchExperienceId: StringToObjectId,
    userId: StringToObjectId,
    content: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const PopulatedCommentSchema = CommentSchema.extend({
    user: UserWithIdSchema,
});

export type PopulatedComment = z.infer<typeof PopulatedCommentSchema>;

export type Comment = z.infer<typeof CommentSchema>;

export const CommentWithId = CommentSchema.extend({
    _id: StringToObjectId,
});

export type CommentWithId = z.infer<typeof CommentWithId>;

export const CreateCommentDTOSchema = CommentSchema.omit({
    createdAt: true,
    updatedAt: true,
});

export type CreateCommentDTO = z.infer<typeof CreateCommentDTOSchema>;
