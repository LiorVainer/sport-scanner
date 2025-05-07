import { ExtendedFixtureItem } from '../models/soccer/fixture.model';

export const FixtureToFlattenedDetails = (fixture: ExtendedFixtureItem) => {
    const { league, fixture: fixtureInfo, teams, price } = fixture;
    const { date } = fixtureInfo;
    const { home, away } = teams;

    return {
        league,
        homeTeam: home,
        awayTeam: away,
        price,
        date,
    };
};

export const FixturesToFlattenedDetails = (fixtures: ExtendedFixtureItem[]) =>
    fixtures.map((fixture) => {
        return FixtureToFlattenedDetails(fixture);
    });
