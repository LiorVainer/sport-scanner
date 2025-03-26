import mongoose from 'mongoose';
import { z, ZodType } from 'zod';

export const ObjectIdSchema: ZodType<mongoose.Types.ObjectId, z.ZodTypeDef, string> = z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId',
    })
    .transform((val) => new mongoose.Types.ObjectId(val));

export const ObjectIdToString: ZodType<string, z.ZodTypeDef, mongoose.Types.ObjectId> = z
    .instanceof(mongoose.Types.ObjectId)
    .transform((val) => val.toHexString());

export const StringToObjectId: ZodType<mongoose.Types.ObjectId, z.ZodTypeDef, string> = z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId format',
    })
    .transform((val) => new mongoose.Types.ObjectId(val));

export const zodDate = z.string().transform((str) => new Date(str));
