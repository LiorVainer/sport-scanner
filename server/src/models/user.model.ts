import { z } from 'zod';
import { ObjectIdToString, zodDate } from '../utils/zod.utils';
import { CityInfoSchema } from './packages/package.model';

export const FavoriteTeamSchema = z.object({
    name: z.string().describe('Team name'),
    id: z.number().describe('Unique identifier of the team'),
    logo: z.string().describe('URL of the team logo'),
});

export const FavoriteLeagueSchema = z.object({
    name: z.string().describe('League name'),
    id: z.number().describe('Unique identifier of the league'),
    logo: z.string().describe('URL of the league logo'),
});

export type FavoriteTeam = z.infer<typeof FavoriteTeamSchema>;
export type FavoriteLeague = z.infer<typeof FavoriteLeagueSchema>;

export const UserSchema = z.object({
    username: z.string(),
    password: z.string(),
    email: z.string(),
    picture: z.string(),
    googleId: z.string().optional(),
    createdAt: zodDate,
    updatedAt: zodDate,
    refreshTokens: z.string().array().optional(),
    favoriteTeams: FavoriteTeamSchema.array().default([]),
    favoriteLeagues: FavoriteLeagueSchema.array().default([]),
    homeAirport: CityInfoSchema.optional(),
    isFirstVisit: z.boolean().optional(),
    suggestedPackages: z.string().array().optional(),
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
