import { ValueOf } from '@/types/common.types';

export const GeneratePackagesSteps = {
    GENERATE_SEARCH_FIXTURE_PARAMS: 'generate_search_fixture_params',
    FETCH_FIXTURES: 'fetch_fixtures',
    FOUND_FIXTURES: 'found_fixtures',
    ADD_PRICE_RANGE_TO_FIXTURES: 'add_price_range_to_fixtures',
    GENERATE_SEARCH_PARAMS: 'generate_search_params',
    SEARCH_FLIGHTS: 'search_flights',
    FOUND_FLIGHTS: 'found_flights',
    GENERATE_PACKAGES: 'generate_packages',
    AI_GENERATED_PACKAGES: 'ai_generated_packages',
    FILTER_PACKAGES: 'filter_packages',
    INVALID_PACKAGES_FILTERED: 'invalid_packages_filtered',
    GENERATING_PACKAGES_METADATA: 'generating_packages_metadata',
    FINISHED_GENERATING_PACKAGES: 'finished_generating_packages',
} as const;

export type GeneratePackagesStep = ValueOf<typeof GeneratePackagesSteps>;

export type GeneratePackagesStepKey = keyof typeof GeneratePackagesSteps;
