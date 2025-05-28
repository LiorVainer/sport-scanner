import { z } from 'zod';
import { PublicUserSchema } from './user.model';
import { PackageWithIdSchema } from './packages/package.model';
import { zodDate } from '@/utils/zod.utils.ts';

export const GroupSchema = z.object({
    _id: z.string(),
    title: z.string().describe('Name of the group'),
    users: PublicUserSchema.array().describe('List of users in the group'),
    dates: z.object({
        start: zodDate,
        end: zodDate,
    }),
    maxBudget: z.number(),
    selectedPackage: PackageWithIdSchema.optional().describe('Selected travel package for the group'),
    suggestedPackagesVotes: z
        .record(z.string(), z.string())
        .optional()
        .describe('Votes for the selected package, mapping user IDs to package IDs'),
    suggestedPackages: PackageWithIdSchema.array().describe('List of suggested travel packages').default([]),
    createdAt: zodDate,
    updatedAt: zodDate,
});

export const CreateGroupPayloadSchema = GroupSchema.omit({
    selectedPackage: true,
    suggestedPackagesVotes: true,
    suggestedPackages: true,
    _id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    users: PublicUserSchema.shape._id.array().describe('List of users in the group'),
});

export const UpdateGroupPayloadSchema = GroupSchema.partial();

export type Group = z.infer<typeof GroupSchema>;
export type CreateGroupPayload = z.infer<typeof CreateGroupPayloadSchema>;
export type UpdateGroupPayload = z.infer<typeof UpdateGroupPayloadSchema>;
