import { z } from 'zod';

export const GroupFormSchema = z.object({
    groupName: z.string().min(1, 'Group name is required'),
    members: z.array(z.string()).min(1, 'At least one group member is required'),
    tripDates: z.tuple([z.string().min(1), z.string().min(1)]).refine(([start, end]) => !!start && !!end, {
        message: 'Trip date range is required',
    }),
    maxBudget: z.coerce.number().min(50, 'Minimum allowed is $50').max(10000, 'Maximum allowed is $10,000'),
});

export type GroupFormValues = z.infer<typeof GroupFormSchema>;

export const GroupFormDefaultValues: GroupFormValues = {
    groupName: '',
    members: [],
    tripDates: ['', ''],
    maxBudget: 1000,
};
