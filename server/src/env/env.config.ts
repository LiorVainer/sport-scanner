import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export const EnvSchema = z.object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    BASE_URL: z.string(),

    DB_CONNECT: z.string().url({ message: 'DB_CONNECT must be a valid MongoDB URL' }),

    TOKEN_SECRET: z.string().min(32, { message: 'TOKEN_SECRET must be at least 32 characters' }),
    TOKEN_EXPIRES: z.string().regex(/^\d+[smhd]$/, {
        message: "TOKEN_EXPIRES must be a valid duration string (e.g., '3h', '30m')",
    }),

    REFRESH_TOKEN_EXPIRES: z.string().regex(/^\d+[smhd]$/, {
        message: "REFRESH_TOKEN_EXPIRES must be a valid duration string (e.g., '7d', '12h')",
    }),

    GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
    AI_MODEL: z.string(),
    AI_MAX_TOKENS: z.coerce.number().int().min(1),
    AI_TEMPERATURE: z.coerce.number().min(0).max(1),

    SEASON: z.coerce.number(),

    API_KEY: z.string(),
    GOOGLE_CLIENT_ID: z.string().regex(/^.+\.apps\.googleusercontent\.com$/, {
        message: 'Invalid Google Client ID format',
    }),

    PAGE_DEFAULT: z.coerce.number().optional(),
    LIMIT_DEFAULT: z.coerce.number().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

const { data: parsedEnv, error } = EnvSchema.safeParse(process.env);

if (error) {
    throw new Error(error.errors[0].message);
}

export const ENV = parsedEnv;
