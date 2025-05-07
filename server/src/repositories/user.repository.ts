import mongoose, { Document, Schema } from 'mongoose';
import { User } from '../models/user.model';

interface FavoriteTeam {
    id: number;
    name: string;
}

interface FavoriteLeague {
    id: number;
    name: string;
}

const CityInfoMongooseSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        iataCode: { type: String, required: true },
    },
    { _id: false }
);

const FavoriteTeamMongoSchema = new mongoose.Schema<FavoriteTeam>(
    {
        name: { type: String, required: true },
        id: { type: Number, required: true },
    },
    { _id: false }
);

const FavoriteLeagueMongoSchema = new mongoose.Schema<FavoriteLeague>(
    {
        name: { type: String, required: true },
        id: { type: Number, required: true },
    },
    { _id: false }
);

const UserMongoSchema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String },
        email: { type: String, required: true },
        picture: { type: String, required: true },
        googleId: { type: String },
        refreshTokens: { type: [String], default: [] },
        favoriteTeams: {
            type: [FavoriteTeamMongoSchema],
            default: [],
        },
        homeAirport: { type: CityInfoMongooseSchema },
        favoriteLeagues: {
            type: [FavoriteLeagueMongoSchema],
            default: [],
        },
        isFirstVisit: { type: Boolean, default: true },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);

export const UserRepository = mongoose.model<User>('Users', UserMongoSchema);
export type UserDocument = Document<unknown, {}, User> &
    User &
    Required<{
        _id: string;
    }> & {
        __v: number;
    };
