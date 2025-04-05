import {z} from "zod";

export const FlightSearchParamsSchema = z.object({
    origin: z.string().min(3),
    destination: z.string().min(3),
    dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    isRoundTrip: z.boolean().default(false),
    maxPrice: z.number().optional(),
    adults: z.number().min(1).max(9).default(1),
});

export type FlightSearchParams = z.infer<typeof FlightSearchParamsSchema>;