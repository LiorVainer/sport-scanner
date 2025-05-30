import { z } from 'zod';

export const GroupFormSchema = z.object({
    title: z.string().min(1, 'title is required'),
    users: z.array(z.string()).min(1, 'At least one user is required'),
    dates: z.tuple([z.string().min(1), z.string().min(1)]).refine(([start, end]) => !!start && !!end, {
        message: 'date range is required',
    }),
    maxBudget: z.coerce.number().min(50, 'Minimum allowed is $50').max(10000, 'Maximum allowed is $10,000'),
});

export type GroupFormValues = z.infer<typeof GroupFormSchema>;

export const GroupFormDefaultValues: GroupFormValues = {
    title: '',
    users: [],
    dates: ['', ''],
    maxBudget: 1000,
};
