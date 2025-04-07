import mongoose, { Document, Schema } from 'mongoose';
import { History } from '../models/history.model';
import { ENV } from '../env/env.config';

const historySchema = new Schema<History>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        packageId: { type: Schema.Types.ObjectId, ref: 'Packages', required: true },
    },
    { timestamps: { createdAt: true, updatedAt: true } }
);

historySchema.index({ createdAt: 1 }, { expireAfterSeconds: ENV.TTL_FOR_HISTORY_DOCUMENTS });

export const HistoryRepository = mongoose.model<History>('histories', historySchema);

export type HistoryDocument = Document<unknown, {}, History>
