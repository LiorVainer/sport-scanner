import { z } from 'zod';
import { PublicUserSchema } from './user.model';
import { zodDate } from '@/utils/zod.utils.ts';
import { PackageSchema } from './packages/package.model';

export const GroupSchema = z.object({
    _id: z.string(),
    title: z.string().describe('Name of the group'),
    users: z.string().array().describe('List of users in the group'),
    dates: z.object({
        start: zodDate,
        end: zodDate,
    }),
    maxBudget: z.number(),
    suggestedPackagesVotes: z
        .record(z.string(), z.string())
        .optional()
        .describe('Votes for the selected package, mapping user IDs to package IDs'),
    suggestedPackages: z.string().array().describe('List of suggested travel packages').default([]),
    selectedPackage: z.string().optional().describe('Selected travel package for the group'),
    createdAt: zodDate,
    updatedAt: zodDate,
    createdBy: z.string().describe('User who created the group'),
});

export const PopulatedGroupSchema = z.object({
    _id: z.string(),
    title: z.string().describe('Name of the group'),
    users: PublicUserSchema.array().describe('List of users in the group'),
    dates: z.object({
        start: zodDate,
        end: zodDate,
    }),
    maxBudget: z.number(),
    suggestedPackagesVotes: z
        .record(z.string(), z.string())
        .optional()
        .describe('Votes for the selected package, mapping user IDs to package IDs'),
    suggestedPackages: PackageSchema.array().describe('List of suggested travel packages').default([]),
    selectedPackage: PackageSchema.optional().describe('Selected travel package for the group'),
    createdAt: zodDate,
    updatedAt: zodDate,
    createdBy: PublicUserSchema.describe('User who created the group'),
});

export const CreateGroupPayloadSchema = GroupSchema.omit({
    selectedPackage: true,
    suggestedPackagesVotes: true,
    suggestedPackages: true,
    _id: true,
    createdBy: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    users: PublicUserSchema.shape._id.array().describe('List of users in the group'),
});

export const UpdateGroupPayloadSchema = GroupSchema.partial();

export type Group = z.infer<typeof GroupSchema>;
export type CreateGroupPayload = z.infer<typeof CreateGroupPayloadSchema>;
export type UpdateGroupPayload = z.infer<typeof UpdateGroupPayloadSchema>;
export type PopulatedGroup = z.infer<typeof PopulatedGroupSchema>;
