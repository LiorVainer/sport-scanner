import { z } from 'zod';
import { PackageSchema } from './package.model';
import { DateRangeSchema } from './package-generate-params.model';
import { ExtendedFixtureItemSchema, FixtureItemSchema, FixtureQueryParamsSchema } from '../soccer/fixture.model';
import { GeneratePackagesSteps } from './packages-generate-steps.model';
import { FlightSearchParamsSchema } from '../flights/flights-search-params.model';
import { CityIataToCityMetadataCodeMapSchema } from '../flights/iata.model';

const BaseUpdateSchema = z.object({
    message: z.string(),
});

const GenerateSearchFixtureParamsSchema = BaseUpdateSchema.extend({
    step: z.literal(GeneratePackagesSteps.GENERATE_SEARCH_FIXTURE_PARAMS),
    dateRange: DateRangeSchema.optional(),
});

const FetchFixturesSchema = BaseUpdateSchema.extend({
    step: z.literal(GeneratePackagesSteps.FETCH_FIXTURES),
    fixturesSearchQueryParamsArray: FixtureQueryParamsSchema.array(),
});

const FoundFixturesSchema = BaseUpdateSchema.extend({
    step: z.literal(GeneratePackagesSteps.FOUND_FIXTURES),
    fixtures: FixtureItemSchema.array(),
});

const AddPriceRangeToFixturesSchema = BaseUpdateSchema.extend({
    step: z.literal(GeneratePackagesSteps.ADD_PRICE_RANGE_TO_FIXTURES),
    fixtures: ExtendedFixtureItemSchema.array(),
});

const GenerateSearchParamsSchema = BaseUpdateSchema.extend({
    step: z.literal(GeneratePackagesSteps.GENERATE_SEARCH_PARAMS),
});

const SearchFlightsSchema = BaseUpdateSchema.extend({
    step: z.literal(GeneratePackagesSteps.SEARCH_FLIGHTS),
    flightOffersSearchesParams: FlightSearchParamsSchema.array(),
    cityIataToCityMetadata: CityIataToCityMetadataCodeMapSchema,
});

const FoundFlightsSchema = BaseUpdateSchema.extend({
    step: z.literal(GeneratePackagesSteps.FOUND_FLIGHTS),
    totalOffers: z.number(),
});

const GeneratePackagesSchema = BaseUpdateSchema.extend({
    step: z.literal(GeneratePackagesSteps.GENERATE_PACKAGES),
});

const AiGeneratedPackagesSchema = BaseUpdateSchema.extend({
    step: z.literal(GeneratePackagesSteps.AI_GENERATED_PACKAGES),
    aiGeneratedCount: z.number(),
});

const FilterPackagesSchema = BaseUpdateSchema.extend({
    step: z.literal(GeneratePackagesSteps.FILTER_PACKAGES),
});

const InvalidPackagesFilteredSchema = BaseUpdateSchema.extend({
    step: z.literal(GeneratePackagesSteps.INVALID_PACKAGES_FILTERED),
    filteredCount: z.number(),
});

const GeneratePackagesMetadataSchema = BaseUpdateSchema.extend({
    step: z.literal(GeneratePackagesSteps.GENERATING_PACKAGES_METADATA),
});

const FinishedGeneratingPackagesSchema = BaseUpdateSchema.extend({
    step: z.literal(GeneratePackagesSteps.FINISHED_GENERATING_PACKAGES),
    packages: PackageSchema.array(),
    durationMs: z.number(),
});

const ErrorProgressSchema = BaseUpdateSchema.extend({
    step: z.literal('error'),
});

export const PackagesGenerationProgressUpdateSchema = z.discriminatedUnion('step', [
    GenerateSearchFixtureParamsSchema,
    FetchFixturesSchema,
    FoundFixturesSchema,
    AddPriceRangeToFixturesSchema,
    GenerateSearchParamsSchema,
    SearchFlightsSchema,
    FoundFlightsSchema,
    GeneratePackagesSchema,
    AiGeneratedPackagesSchema,
    FilterPackagesSchema,
    FinishedGeneratingPackagesSchema,
    ErrorProgressSchema,
    GeneratePackagesMetadataSchema,
    InvalidPackagesFilteredSchema,
]);

export type PackagesGenerationProgressUpdate = z.infer<typeof PackagesGenerationProgressUpdateSchema>;
