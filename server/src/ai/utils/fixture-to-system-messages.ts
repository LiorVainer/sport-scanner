import { CoreSystemMessage } from 'ai';
import { message, system } from './message.utils';
import { FixtureItem } from '../../models/fixture.model';

export const generateSystemMessagesFromFixture = (fixture: FixtureItem): CoreSystemMessage[] => [
    message.system(`This is a soccer match between ${fixture.teams.home.name} and ${fixture.teams.away.name}.`),
    message.system(`It will take place at ${fixture.fixture.venue.name} in ${fixture.fixture.venue.city}.`),
    message.system(
        `The league is ${fixture.league.name} (${fixture.league.country}), season ${fixture.league.season}.`
    ),
    message.system(`Match date: ${fixture.fixture.date}.`),
];

export const generateUserMessageForFixturePriceMap = (fixtures: FixtureItem[]) => {
    const lines = fixtures.map(({ fixture, teams, league }) => {
        const { id, venue, date } = fixture;
        const { home, away } = teams;
        const { name: venueName, city } = venue;
        const { name: leagueName, season } = league;

        return message.user(
            `Fixture ${id}: ${home.name} vs ${away.name} at ${venueName} (${city}), date: ${date}, league: ${leagueName}, season: ${season}`
        );
    });

    return [message.user(`Estimate the ticket price range (in EUR) for the following soccer fixtures:\n`), ...lines];
};
