import {LogSchema, ProcessTypes} from "../log.model";
import {z} from "zod";

export const GeneratePackagesLogSchema = LogSchema.extend({
    processType: z.literal(ProcessTypes.GENERATE_PACKAGES),
    additionalInfo: z
        .object({
            fixturesCount: z.number().describe('Number of fetched fixtures'),
            flightsCount: z.number().describe('Total number of flight offers retrieved'),
            packagesGenerated: z.number().describe('Number of packages generated before filtering'),
            packagesValid: z.number().describe('Number of valid packages after filtering'),
        })
        .optional(),
});