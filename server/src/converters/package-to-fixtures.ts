import {PackagesGenerationParams} from '../models/packages/package-generate-params.model';
import {FixtureQueryParams} from '../models/soccer/fixture.model';
import {calculateCurrentSeason} from '../utils/soccer.utils';

export const convertPackageGenerateParamsToFixtureQueryParams = (
    params: PackagesGenerationParams
): FixtureQueryParams => ({
    from: params.date?.from ? new Date(params.date.from).toISOString().slice(0, 10) : undefined,
    to: params.date?.to ? new Date(params.date.to).toISOString().slice(0, 10) : undefined,
    league: params.league ? params.league : undefined,
    team: params.team ? params.team : undefined,
    season: calculateCurrentSeason(new Date()),
});
