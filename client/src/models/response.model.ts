import { z } from 'zod';

export const OkResponseSchema = z.object({
    ok: z.boolean(),
    data: z.any(),
});

export type OkResponse = z.infer<typeof OkResponseSchema>;
