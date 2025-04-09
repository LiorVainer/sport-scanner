import { z } from 'zod';
import { StringToObjectId, zodDate } from '../utils/zod.utils';
import { PackageDocumentSchema } from './package.model';

const HistorySchema = z.object({
    _id: StringToObjectId,
    userId: StringToObjectId,
    packageId: StringToObjectId,
    createdAt: zodDate,
    updatedAt: zodDate,
});

const PopulatedHistorySchema = z.object({
    _id: z.string(),
    packages: z.array(PackageDocumentSchema),
});

export type History = z.infer<typeof HistorySchema>;
export type PopulatedHistory = z.infer<typeof PopulatedHistorySchema>;
