import {PackageGenerateParams} from '../models/package-generate-params.model';
import {FixtureQueryParams} from "../models/fixture.model";
import {calculateCurrentSeason} from "../utils/soccer.utils";

export const convertPackageGenerateParamsToFixtureQueryParams = (
    params: PackageGenerateParams
): FixtureQueryParams => ({
    from: params.date?.from ? new Date(params.date.from).toISOString().slice(0, 10) : undefined,
    to: params.date?.to ? new Date(params.date.to).toISOString().slice(0, 10) : undefined,
    league: params.league ? parseInt(params.league) : undefined,
    team: params.team ? parseInt(params.team) : undefined,
    season: calculateCurrentSeason(new Date())
});
