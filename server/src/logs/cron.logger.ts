import { ProcessTypes } from '../models/log.model';
import { BaseLogger } from './base-logger.logger';

class UserPackagesSuggestionsGenerationLogger extends BaseLogger {
    constructor() {
        super(ProcessTypes.USER_SUGGESTED_PACKAGES_GENERATION);
    }
}

export const userSuggestedPackagesGenerationLogger = new UserPackagesSuggestionsGenerationLogger();
