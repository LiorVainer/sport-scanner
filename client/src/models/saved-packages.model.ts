import { z } from 'zod';

const SavedPackageSchema = z.object({
    userId: z.string(),
    packageId: z.string(),
});

export type SavedPackage = z.infer<typeof SavedPackageSchema>;
