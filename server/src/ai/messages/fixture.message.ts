import { ExtendedFixtureItem, ExtendedFixtureItemSchema, FixtureItem } from '../../models/soccer/fixture.model';
import { CoreMessage } from 'ai';
import { message } from './utils/message.utils';
import { ENV } from '../../env/env.config';
import { zodToJsonSchema } from 'zod-to-json-schema';

const FixtureMessageParser = {
    basicDetails: (fixture: ExtendedFixtureItem): string => {
        const { id, date } = fixture.fixture;
        return `Match ${id}: ${fixture.teams.home.name} (logo url: ${fixture.teams.home.logo}) vs ${fixture.teams.away.name} (logo url: ${fixture.teams.away.logo}) on ${date}`;
    },
    venueDetails: (fixture: ExtendedFixtureItem): string => {
        const { name, city, country, image, capacity } = fixture.fixture.venue;
        return `Venue: ${name} (${city}, ${country}) (capacity: ${capacity}), image url: ${image}`;
    },
    leagueDetails: (fixture: ExtendedFixtureItem): string => {
        const { name, logo, round } = fixture.league;
        return `League: ${name} (logo url: ${logo}), round: ${round}`;
    },
    priceRange: (fixture: ExtendedFixtureItem): string => {
        const range = fixture.price ? `${fixture.price.min} - ${fixture.price.max} (${ENV.CURRENCY_CODE})` : `unknown`;
        return `Price: ${range}`;
    },
};

export const FixtureContextMessagesGenerator = {
    create: (fixture: ExtendedFixtureItem): CoreMessage => {
        const basicDetails = FixtureMessageParser.basicDetails(fixture);
        const venueDetails = FixtureMessageParser.venueDetails(fixture);
        const leagueDetails = FixtureMessageParser.leagueDetails(fixture);
        const priceRange = FixtureMessageParser.priceRange(fixture);

        return message.system([basicDetails, venueDetails, leagueDetails, priceRange].join('\n'));
    },
    json: (fixture: ExtendedFixtureItem): CoreMessage => {
        return message.system(JSON.stringify(fixture, null, 2));
    },
    context: (): CoreMessage =>
        message.system(
            '⚽ The following object describes a football match including teams, location, league, and price.'
        ),

    itemsArrayIntro: (): CoreMessage => {
        const intro = `⚽ This is a list of upcoming football fixtures that can be used in travel packages.
         Each match includes team info, city, stadium, date, and ticket price range (and more).
         
        The schema of each fixture is as follows:`;

        const extendedFixtureItemJsonSchema = zodToJsonSchema(ExtendedFixtureItemSchema);

        return message.system(`
             ${intro}
             ${JSON.stringify(extendedFixtureItemJsonSchema, null, 2)}
        `);
    },

    itemsArray: (fixtures: ExtendedFixtureItem[]): CoreMessage[] =>
        fixtures.map((fixture) => FixtureContextMessagesGenerator.create(fixture)),

    priceMapGenerationContext: (fixtures: FixtureItem[]) => {
        const lines = fixtures.map(({ fixture, teams, league }) => {
            const { id, venue, date } = fixture;
            const { home, away } = teams;
            const { name: venueName, city } = venue;
            const { name: leagueName, season } = league;

            return message.user(
                `Fixture ${id}: ${home.name} vs ${away.name} at ${venueName} (${city}), date: ${date}, league: ${leagueName}, season: ${season}`
            );
        });

        return [
            message.user(
                `Estimate the ticket price range (in ${ENV.CURRENCY_CODE}) for the following soccer fixtures:\n`
            ),
            ...lines,
        ];
    },
};
