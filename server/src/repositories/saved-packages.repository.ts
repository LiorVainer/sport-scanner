import mongoose, { Document, Schema } from 'mongoose';
import { SavedPackage } from '../models/saved-packages.model';

const savedPackagesSchema = new Schema<SavedPackage>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
        packageId: { type: Schema.Types.ObjectId, ref: 'Packages', required: true },
    },
    { timestamps: { createdAt: true, updatedAt: true } }
);

export const SavedPackageRepository = mongoose.model<SavedPackage>('savedPackages', savedPackagesSchema);

export type SavedPackageDocument = Document<unknown, {}, SavedPackage>
