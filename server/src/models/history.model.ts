import { z } from 'zod';
import { StringToObjectId } from '../utils/zod.utils';

const HistorySchema = z.object({
    userId: StringToObjectId,
    packageId: StringToObjectId,
});

export type History = z.infer<typeof HistorySchema>;
