import { z } from 'zod';
import { PublicUserSchema } from './user.model';
import { PackageSchema } from './packages/package.model';
import { zodDate } from '@/utils/zod.utils.ts';

export const GroupSchema = z.object({
    title: z.string().describe('Name of the group'),
    users: PublicUserSchema.array().describe('List of users in the group'),
    dates: z.object({
        start: zodDate,
        end: zodDate,
    }),
    maxBudget: z.number(),
    selectedPackage: PackageSchema.describe('Selected travel package for the group'),
});

export const GroupWithIdSchema = GroupSchema.extend({
    _id: z.string(),
    createdAt: zodDate,
    updatedAt: zodDate,
});

export const CreateGroupPayloadSchema = GroupSchema.omit({ selectedPackage: true });
export const UpdateGroupPayloadSchema = GroupSchema.partial();

export type Group = z.infer<typeof GroupSchema>;
export type GroupWithId = z.infer<typeof GroupWithIdSchema>;
export type CreateGroupPayload = z.infer<typeof CreateGroupPayloadSchema>;
export type UpdateGroupPayload = z.infer<typeof UpdateGroupPayloadSchema>;
