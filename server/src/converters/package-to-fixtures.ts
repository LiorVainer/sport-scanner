import { PackagesGenerationParams } from '../models/packages/package-generate-params.model';
import { FixtureQueryParams } from '../models/soccer/fixture.model';
import { calculateCurrentSeason } from '../utils/soccer.utils';

export const convertPackageGenerateParamsToFixturesSearchQueryParams = (
    params: PackagesGenerationParams
): FixtureQueryParams[] => {
    console.log({ params });
    const from = params.date?.from?.toISOString().slice(0, 10);
    const to = params.date?.to?.toISOString().slice(0, 10);
    const season = calculateCurrentSeason(new Date());

    return params.teams
        ? params.teams?.map((team) => ({ from, to, team: team.id, season }))
        : params.league
          ? [{ from, to, league: params.league.id, season }]
          : [];
};
