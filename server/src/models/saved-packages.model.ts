import { z } from 'zod';
import { StringToObjectId } from '../utils/zod.utils';
import { PackageSchema } from './package.model';

const SavedPackageSchema = z.object({
    userId: StringToObjectId,
    package: PackageSchema,
});

export type SavedPackage = z.infer<typeof SavedPackageSchema>;
