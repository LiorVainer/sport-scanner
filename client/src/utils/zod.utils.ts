import { z } from 'zod';

export const zodDate = z.string().transform((str) => new Date(str));
