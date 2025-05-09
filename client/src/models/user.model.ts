import { z } from 'zod';
import { zodDate } from '@/utils/zod.utils.ts';
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
    homeAirport: CityInfoSchema.optional(),
    favoriteTeams: FavoriteTeamSchema.array().optional(),
    favoriteLeagues: FavoriteLeagueSchema.array().optional(),
    isFirstVisit: z.boolean().optional(),
});

export const RegisterPayload = UserSchema.omit({ createdAt: true, updatedAt: true });
export type RegisterPayload = z.infer<typeof RegisterPayload>;

export const LoginPayload = UserSchema.pick({ email: true, password: true });
export type LoginPayload = z.infer<typeof LoginPayload>;

export const UserUpdatePayload = UserSchema.pick({ picture: true, username: true }).partial();
export type UserUpdatePayload = z.infer<typeof UserUpdatePayload>;

export const UserPreferencesPayload = UserSchema.pick({
    favoriteTeams: true,
    homeAirport: true,
    favoriteLeagues: true,
    isFirstVisit: true,
}).partial();

export type UserPreferencesPayload = z.infer<typeof UserPreferencesPayload>;

export type User = z.infer<typeof UserSchema>;

export const UserWithIdSchema = UserSchema.extend({
    _id: z.string(),
});

export const PublicUserSchema = UserWithIdSchema.omit({
    password: true,
    refreshTokens: true,
});

export const AuthResponseSchema = PublicUserSchema.extend({
    accessToken: z.string(),
    refreshToken: z.string(),
});

export const RefreshTokenResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});

export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export type PublicUser = z.infer<typeof PublicUserSchema>;

export type UserWithId = z.infer<typeof UserWithIdSchema>;

export const UserWithoutTimestampsSchema = UserSchema.omit({
    createdAt: true,
    updatedAt: true,
});

export type UserPayload = z.infer<typeof UserWithoutTimestampsSchema>;
