import { z } from 'zod';
import { StringToObjectId } from '../utils/zod.utils';
import { PackageSchema } from './package.model';

const HistorySchema = z.object({
    userId: StringToObjectId,
    package: PackageSchema,
});

export type History = z.infer<typeof HistorySchema>;
