import mongoose, { Document, Schema } from 'mongoose';
import { Package } from '../models/package.model';
import { PackageSchema } from './saved-packages.repository';
import { History } from '../models/history.model';

const historySchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        package: { type: PackageSchema, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: true } }
);

export const HistoryRepository = mongoose.model<Package>('histories', historySchema);

export type HistoryDocument = Document<unknown, {}, History> &
    History & {
        __v: number;
    };
