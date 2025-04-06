import mongoose, { Document, Schema } from 'mongoose';
import { History } from '../models/history.model';

const historySchema = new Schema<History>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        packageId: { type: Schema.Types.ObjectId, ref: 'Packages', required: true },
    },
    { timestamps: { createdAt: true, updatedAt: true } }
);

export const HistoryRepository = mongoose.model<History>('histories', historySchema);

export type HistoryDocument = Document<unknown, {}, History>
