import mongoose, { Document, Schema } from 'mongoose';
import { User } from '../models/user.model';

const CityInfoMongooseSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        iataCode: { type: String, required: true },
    },
    { _id: false }
);

const TeamNoLogoMongooseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    id: { type: Number, required: true },
});

const UserMongoSchema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String },
        email: { type: String, required: true },
        picture: { type: String, required: true },
        googleId: { type: String },
        refreshTokens: { type: [String], default: [] },
        favoriteTeams: {
            type: [TeamNoLogoMongooseSchema],
            default: [],
            set: (teams: any[]) =>
                Array.isArray(teams)
                    ? teams.filter((team) => team && typeof team.id === 'number' && typeof team.name === 'string')
                    : [],
        },
        homeAirport: { type: CityInfoMongooseSchema },
        favoriteLeagues: { type: [String], default: [] },
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
