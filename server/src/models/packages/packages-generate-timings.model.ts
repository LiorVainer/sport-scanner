import {ValueOf} from "../../types/general.types";
import {GeneratePackagesStepKey} from "./packages-generate-steps.model";

export const GeneratePackagesTimingSteps = {
    GENERATE_SEARCH_FIXTURE_PARAMS: 'generateSearchFixtureParamsMs',
    FETCH_FIXTURES: 'fetchFixturesMs',
    ADD_PRICE_RANGE_TO_FIXTURES: 'addPriceRangeToFixturesMs',
    GENERATE_SEARCH_PARAMS: 'generateSearchParamsMs',
    SEARCH_FLIGHTS: 'searchFlightsMs',
    GENERATE_PACKAGES: 'generatePackagesMs',
    FINISHED_GENERATING_PACKAGES: 'finishedGeneratingPackagesMs',
    FILTER_PACKAGES: 'filterPackagesMs',
    TOTAL: 'totalMs',
} satisfies Partial<Record<GeneratePackagesStepKey, string>> & Record<string, string>;

export type GeneratePackagesTimingStep = ValueOf<typeof GeneratePackagesTimingSteps>;
