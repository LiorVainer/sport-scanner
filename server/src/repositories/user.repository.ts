import mongoose, { Document, Schema } from 'mongoose';
import { User } from '../models/user.model';

const UserMongoSchema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String },
        email: { type: String, required: true },
        picture: { type: String, required: true },
        googleId: { type: String },
        refreshTokens: { type: [String], default: [] },
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
