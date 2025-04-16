import { FixtureItem, FixtureItemWithPrice } from '../models/soccer/fixture.model';

export const FixtureToFlattenedDetails = (fixture: FixtureItemWithPrice) => {
    const { league, fixture: fixtureInfo, teams, price } = fixture;
    const { date } = fixtureInfo;
    const { home, away } = teams;

    return {
        league: league.name,
        leagueLogo: league.logo,
        homeTeam: home,
        awayTeam: away,
        price,
        date,
    };
};

export const FixturesToFlattenedDetails = (fixtures: FixtureItem[]) =>
    fixtures.map((fixture) => {
        return FixtureToFlattenedDetails(fixture);
    });
