import mongoose, { Document, Schema } from 'mongoose';
import { Group, PopulatedGroup } from '../models/group.model';

const DateRangeSchema = new Schema(
    {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    { _id: false }
);

export const GroupMongoSchema = new Schema<Group>(
    {
        title: { type: String, required: true },
        users: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
        dates: { type: DateRangeSchema, required: true },
        maxBudget: { type: Number, required: true },
        suggestedPackagesVotes: {
            type: Map,
            of: { type: Schema.Types.ObjectId, ref: 'Packages' },
            required: false,
            default: {},
        },
        suggestedPackages: [{ type: Schema.Types.ObjectId, ref: 'Packages', required: false }],
        selectedPackage: { type: Schema.Types.ObjectId, ref: 'Packages', required: false },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);

export const GroupRepository = mongoose.model('Groups', GroupMongoSchema);

export type PopulatedGroupDocument = Document<unknown, {}, PopulatedGroup> &
    PopulatedGroup & {
        __v: number;
    };
