import {GeneratePackagesSteps} from "@/models/packages/packages-generate-steps.model";
import {PackagesGenerationProgressUpdate} from "@/models/packages/package-generation-progress-update.model.ts";

export const getProgressStepMessage = (progressUpdate: PackagesGenerationProgressUpdate): string => {
    switch (progressUpdate.step) {
        case GeneratePackagesSteps.GENERATE_SEARCH_FIXTURE_PARAMS:
            return '🔍 Preparing match search with your selected filters...';

        case GeneratePackagesSteps.FETCH_FIXTURES:
            return '📡 Fetching upcoming matches...';

        case GeneratePackagesSteps.FOUND_FIXTURES:
            return `🎯 Found ${progressUpdate.fixturesCount} match${progressUpdate.fixturesCount > 1 ? 'es' : ''}`;

        case GeneratePackagesSteps.ADD_PRICE_RANGE_TO_FIXTURES:
            return '💰 Estimating ticket prices for each match...';

        case GeneratePackagesSteps.GENERATE_SEARCH_PARAMS:
            return '✈️ Planning your travel routes...';

        case GeneratePackagesSteps.SEARCH_FLIGHTS:
            return `🛫 Searching for flights across ${progressUpdate.totalRequests} routes...`;

        case GeneratePackagesSteps.FOUND_FLIGHTS:
            return `📦 Found ${progressUpdate.totalOffers} flight options!`;

        case GeneratePackagesSteps.GENERATE_PACKAGES:
            return '🤖 Letting AI generate travel packages for you...';

        case GeneratePackagesSteps.AI_GENERATED_PACKAGES:
            return `🧠 AI created ${progressUpdate.aiGeneratedCount} potential packages`;

        case GeneratePackagesSteps.FILTER_PACKAGES:
            return '🧪 Filtering packages by quality and rules...';

        case GeneratePackagesSteps.FINISHED_GENERATING_PACKAGES:
            return `✅ Found ${progressUpdate.packages.length} great packages for your trip! (took ${(progressUpdate.durationMs / 1000).toFixed(2)} seconds)`;

        case 'error':
            return '❌ Something went wrong during package generation.';

        default:
            return 'Working on it...';
    }
};
