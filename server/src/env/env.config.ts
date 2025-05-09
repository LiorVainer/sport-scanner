import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export const EnvSchema = z.object({
    // =======================
    // 🚀 Server Configuration
    // =======================
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // =======================
    // 🌐 Database Configuration
    // =======================
    DB_CONNECT: z.string().url({ message: 'DB_CONNECT must be a valid MongoDB URL' }),

    // =======================
    // 🔐 JWT Configuration
    // =======================
    TOKEN_SECRET: z.string().min(32, { message: 'TOKEN_SECRET must be at least 32 characters' }),
    TOKEN_EXPIRES: z.string().regex(/^\d+[smhd]$/, {
        message: "TOKEN_EXPIRES must be a valid duration string (e.g., '3h', '30m')",
    }),

    REFRESH_TOKEN_EXPIRES: z.string().regex(/^\d+[smhd]$/, {
        message: "REFRESH_TOKEN_EXPIRES must be a valid duration string (e.g., '7d', '12h')",
    }),

    // =======================
    // 💲 Currency Configuration
    // =======================
    CURRENCY_CODE: z.string().length(3, { message: 'CURRENCY_CODE must be a 3-letter currency code' }),

    // =======================
    // ✈️ Flight & Package Configuration
    // =======================
    MAX_FLIGHT_OFFERS_PER_REQUEST: z.coerce
        .number()
        .int()
        .min(1, { message: 'MAX_FLIGHT_OFFERS_PER_REQUEST must be a positive integer' }),
    MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH: z.coerce
        .number()
        .int()
        .min(1, { message: 'MAX_AMOUNT_OF_PACKAGES_IN_ONE_SEARCH must be a positive integer' }),

    // =======================
    // 💡 AI Configuration
    // =======================
    GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
    AI_MODEL: z.string(),
    AI_MAX_TOKENS: z.coerce.number().int().min(1),
    AI_TEMPERATURE: z.coerce.number().min(0).max(1),

    // =======================
    // ⚽ Soccer API Configuration
    // =======================
    SOCCER_SEASON: z.coerce.number(),
    SOCCER_API_BASE_URL: z.string().url({ message: 'SOCCER_API_BASE_URL must be a valid URL' }),
    SOCCER_API_KEY: z.string(),

    // =======================
    // ✈️ Amadeus API Configuration
    // =======================
    AMADEUS_API_KEY: z.string(),
    AMADEUS_API_SECRET: z.string(),
    AMADEUS_API_URL: z.string().url({ message: 'AMADEUS_API_URL must be a valid URL' }),

    // =======================
    // 🔍 Google OAuth Configuration
    // =======================
    GOOGLE_CLIENT_ID: z.string().regex(/^.+\.apps\.googleusercontent\.com$/, {
        message: 'Invalid Google Client ID format',
    }),

    // =======================
    // 📦 User Suggested Packages Generation
    // =======================
    USER_SUGGESTED_PACKAGES_GENERATION_MAX_CONCURRENT_REQUESTS: z.coerce.number().int().min(1),
    USER_SUGGESTED_PACKAGES_GENERATION_MAX_PACKAGES_PER_USER: z.coerce.number().int().min(1),
    USER_SUGGESTED_PACKAGES_GENERATION_START_DATE_OFFSET: z.coerce.number().int().min(1),
    USER_SUGGESTED_PACKAGES_GENERATION_END_DATE_OFFSET: z.coerce.number().int().min(1),
    USER_SUGGESTED_PACKAGES_GENERATION_MAX_PRICE: z.coerce.number().int().min(1),
    USER_SUGGESTED_PACKAGES_GENERATION_MAX_PACKAGES_OFFSET: z.coerce.number().int().min(1),

    // =======================
    // 📝 Logtail Configuration
    // =======================
    LOGTAIL_SOURCE_TOKEN: z.string(),
    LOGTAIL_INGESTING_HOST: z.string().url({ message: 'LOGTAIL_INGESTING_HOST must be a valid URL' }),

    // =======================
    // 🔄 Flight & Fixture Search Configuration
    // =======================
    FLIGHT_SEARCH_CONCURRENCY_LIMIT: z.coerce
        .number()
        .int()
        .min(1, { message: 'FLIGHT_SEARCH_CONCURRENCY_LIMIT must be a positive integer' }),

    FIXTURE_SEARCH_CONCURRENCY_LIMIT: z.coerce
        .number()
        .int()
        .min(1, { message: 'FIXTURE_SEARCH_CONCURRENCY_LIMIT must be a positive integer' }),

    // =======================
    // 📄 Pagination Defaults
    // =======================
    PAGE_DEFAULT: z.coerce.number().optional(),
    LIMIT_DEFAULT: z.coerce.number().optional(),
    TTL_FOR_HISTORY_DOCUMENTS: z.coerce.number().default(60 * 60 * 24 * 14),
});

export type Env = z.infer<typeof EnvSchema>;

const { data: parsedEnv, error } = EnvSchema.safeParse(process.env);

if (error) {
    console.error(error.errors);
    throw new Error(error.errors[0].message);
}

export const ENV = parsedEnv;
