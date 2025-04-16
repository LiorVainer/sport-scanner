import { z } from 'zod';
import { zodDate } from '@/utils/zod.utils';
import { PackageDocumentSchema } from './packages/package.model';

const SavedPackageSchema = z.object({
    _id: z.string(),
    userId: z.string(),
    packageId: z.string(),
    createdAt: zodDate,
    updatedAt: zodDate,
});

const PopulatedSavedPackageSchema = z.object({
    _id: z.string(),
    packages: z.array(PackageDocumentSchema),
});

export type SavedPackage = z.infer<typeof SavedPackageSchema>;
export type PopulatedSavedPackage = z.infer<typeof PopulatedSavedPackageSchema>;
