import mongoose, { Document, Schema } from 'mongoose';
import { MatchExperience } from '../models/match-experience.model';

const MatchExperienceMongoSchema = new Schema(
    {
        homeTeam: { type: String, required: true },
        awayTeam: { type: String, required: true },
        matchDate: { type: Date, required: true },
        league: { type: String, required: true },
        country: { type: String, required: true },
        stadium: { type: String, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        likes: { type: [String], default: [] },
        picture: { type: String },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);

export const MatchExperienceRepository = mongoose.model<MatchExperience>(
    'MatchExperiences',
    MatchExperienceMongoSchema
);

export type MatchExperienceDocument = Document<unknown, {}, MatchExperience> &
    MatchExperience & {
        __v: number;
    };
