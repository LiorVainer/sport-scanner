import { z } from 'zod';
import { StringToObjectId, zodDate } from '../utils/zod.utils';
import { PackageDocumentSchema } from './package.model';

const SavedPackageSchema = z.object({
    _id: StringToObjectId,
    userId: StringToObjectId,
    packageId: StringToObjectId,
    createdAt: zodDate,
    updatedAt: zodDate,
});

const PopulatedSavedPackageSchema = z.object({
    _id: z.string(),
    packages: z.array(PackageDocumentSchema),
});

export type SavedPackage = z.infer<typeof SavedPackageSchema>;
export type PopulatedSavedPackage = z.infer<typeof PopulatedSavedPackageSchema>;
