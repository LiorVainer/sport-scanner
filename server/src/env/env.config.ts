import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export const EnvSchema = z.object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    DB_CONNECT: z.string().url({ message: 'DB_CONNECT must be a valid MongoDB URL' }),

    TOKEN_SECRET: z.string().min(32, { message: 'TOKEN_SECRET must be at least 32 characters' }),
    TOKEN_EXPIRES: z.string().regex(/^\d+[smhd]$/, {
        message: "TOKEN_EXPIRES must be a valid duration string (e.g., '3h', '30m')",
    }),

    REFRESH_TOKEN_EXPIRES: z.string().regex(/^\d+[smhd]$/, {
        message: "REFRESH_TOKEN_EXPIRES must be a valid duration string (e.g., '7d', '12h')",
    }),

    CURRENCY_CODE: z.string().length(3, { message: 'CURRENCY_CODE must be a 3-letter currency code' }),

    MAX_FLIGHT_OFFERS_PER_FIXTURE: z.coerce
        .number()
        .int()
        .min(1, { message: 'MAX_FLIGHT_OFFERS_PER_FIXTURE must be a positive integer' }),
    MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH: z.coerce
        .number()
        .int()
        .min(1, { message: 'MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH must be a positive integer' }),

    GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
    AI_MODEL: z.string(),
    AI_MAX_TOKENS: z.coerce.number().int().min(1),
    AI_TEMPERATURE: z.coerce.number().min(0).max(1),

    SEASON: z.coerce.number(),
    FLIGHT_DATE_OFFSET_DAYS: z.coerce
        .number()
        .int()
        .min(1, { message: 'FLIGHT_DATE_OFFSET_DAYS must be a positive integer' }),

    SOCCER_API_BASE_URL: z.string().url({ message: 'SOCCER_API_BASE_URL must be a valid URL' }),
    SOCCER_API_KEY: z.string(),
    AMADEUS_API_KEY: z.string(),
    AMADEUS_API_SECRET: z.string(),
    AMADEUS_API_URL: z.string().url({ message: 'AMADEUS_API_URL must be a valid URL' }),
    GOOGLE_CLIENT_ID: z.string().regex(/^.+\.apps\.googleusercontent\.com$/, {
        message: 'Invalid Google Client ID format',
    }),
    FLIGHT_SEARCH_CONCURRENCY_LIMIT: z.coerce
        .number()
        .int()
        .min(1, { message: 'FLIGHT_SEARCH_CONCURRENCY_LIMIT must be a positive integer' }),

    PAGE_DEFAULT: z.coerce.number().optional(),
    LIMIT_DEFAULT: z.coerce.number().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

const { data: parsedEnv, error } = EnvSchema.safeParse(process.env);

if (error) {
    console.error(error.errors);
    throw new Error(error.errors[0].message);
}

export const ENV = parsedEnv;
