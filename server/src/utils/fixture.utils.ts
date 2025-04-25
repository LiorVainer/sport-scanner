import { ExtendedFixtureItem } from '../models/soccer/fixture.model';

export const sortFixturesByDate = (fixtures: ExtendedFixtureItem[]) =>
    fixtures.sort((itemA, itemB) => {
        const dateA = new Date(itemA.fixture.date).getTime();
        const dateB = new Date(itemB.fixture.date).getTime();
        return dateA - dateB;
    });
