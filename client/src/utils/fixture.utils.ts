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

export const sortFixturesByDate = (fixtures: ExtendedFixtureItem[]) => {
    return fixtures.sort((itemA, itemB) => {
        const dateA = new Date(itemA.fixture.date).getTime();
        const dateB = new Date(itemB.fixture.date).getTime();
        return dateA - dateB;
    });
};
