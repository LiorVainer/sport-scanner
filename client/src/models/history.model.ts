import { z } from 'zod';
import { PackageDocumentSchema } from './package.model';
import { zodDate } from '@/utils/zod.utils';

const HistorySchema = z.object({
    _id: z.string(),
    userId: z.string(),
    packageId: z.string(),
    createdAt: zodDate,
    updatedAt: zodDate,
});

const PopulatedHistorySchema = z.object({
    _id: z.string(),
    packages: z.array(PackageDocumentSchema),
});

export type History = z.infer<typeof HistorySchema>;
export type PopulatedHistory = z.infer<typeof PopulatedHistorySchema>;
