import { z } from 'zod';

const HistorySchema = z.object({
    userId: z.string(),
    packageId: z.string(),
});

export type History = z.infer<typeof HistorySchema>;
