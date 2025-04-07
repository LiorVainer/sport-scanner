import {FixtureItem} from "../models/soccer/fixture.model";

export const FixtureToFlattenedDetails = (fixture: FixtureItem) => {
    const {league, fixture: fixtureInfo, teams} = fixture;
    const {date} = fixtureInfo;
    const {home, away} = teams;

    return {
        league: league.name,
        leagueLogo: league.logo,
        homeTeam: home,
        awayTeam: away,
        date,
    };
}

export const FixturesToFlattenedDetails = (fixtures: FixtureItem[]) =>
    fixtures.map((fixture) => {
        return FixtureToFlattenedDetails(fixture);
    })