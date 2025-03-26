import { z } from 'zod';

export const FiltersSchema = z
    .object({
        dateRange: z
            .object({
                startDate: z
                    .string()
                    .describe(
                        'Start date for the search in YYYY-MM-DD format. Should be before the end date and after the current date.'
                    ),
                endDate: z
                    .string()
                    .describe('End date for the search in YYYY-MM-DD format. Should be after the start date.'),
            })
            .optional()
            .describe('Filter results by a range of dates.'),
        budget: z
            .object({
                min: z.number().nonnegative().describe('Minimum budget for the search.'),
                max: z.number().positive().optional().describe('Maximum budget for the search.'),
            })
            .describe('Specify the budget range for events.'),
        startAirport: z
            .string()
            .describe(
                'The IATA airport code for the city where the user is starting their journey. based on home country that was provided'
            ),
        firstDestination: z.object({
            team: z
                .string()
                .describe(
                    'The name of the team that user wants to travel to first, such as "Real Madrid" or "FC Barcelona".'
                ),
            airport: z
                .string()
                .describe(
                    'The IATA airport code corresponding to the city of the team that user wants to travel to first'
                ),
            league: z
                .string()
                .describe(
                    'The Domestic league the team of the team that user wants to travel to first is participating in, such as "La Liga" or "Premier League".'
                ),
            distance: z
                .number()
                .describe(
                    'The distance between the team and the starting airport of the home city and country in Kilometers Unit.'
                ),
        }),
        leagues: z
            .array(z.string())
            .describe(
                'List of favorite leagues that the user is interested in. should include the league name like "La Liga" or "Premier League"'
            ),
        countries: z
            .array(z.string())
            .describe(
                'List of countries of the destinations. should include the country name like "Spain" or "England"'
            ),
        destinations: z
            .array(
                z.object({
                    team: z.string().describe('The name of the team, such as "Real Madrid" or "FC Barcelona".'),
                    airport: z.string().describe('The IATA airport code corresponding to the city of the team.'),
                    league: z
                        .string()
                        .describe(
                            'The Domestic league the team is participating in, such as "La Liga" or "Premier League".'
                        ),
                    distance: z
                        .number()
                        .describe(
                            'The distance between the team and the first destination airport. in Kilometers Unit'
                        ),
                    description: z
                        .string()
                        .describe(
                            'A description of why this destination is recommended for the user based on his prompt'
                        ),
                })
            )
            .describe(
                'A list of destinations that are close to first destination city that pair each team with its corresponding airport. For example, "Real Madrid" with "MAD" or "FC Barcelona" with "BCN". Sort Destinations By Distance Ascending.'
            ),
    })
    .describe('SearchFilters');
