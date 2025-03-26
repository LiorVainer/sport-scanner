import { z } from 'zod';
import { ObjectIdToString, zodDate } from '../utils/zod.utils';

export const UserSchema = z.object({
    username: z.string(),
    password: z.string(),
    email: z.string(),
    picture: z.string(),
    googleId: z.string().optional(),
    createdAt: zodDate,
    updatedAt: zodDate,
    refreshTokens: z.string().array().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const UserWithIdSchema = UserSchema.extend({
    _id: ObjectIdToString,
});

export const PublicUserSchema = UserWithIdSchema.omit({
    password: true,
    refreshTokens: true,
});

export type UserWithId = z.infer<typeof UserWithIdSchema>;

export const UserWithoutTimestampsSchema = UserSchema.omit({
    createdAt: true,
    updatedAt: true,
});

export type PublicUser = z.infer<typeof PublicUserSchema>;
export type UserPayload = z.infer<typeof UserWithoutTimestampsSchema>;
