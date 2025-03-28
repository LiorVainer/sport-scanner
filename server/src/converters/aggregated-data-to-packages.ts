import { CoreMessage, CoreSystemMessage } from 'ai';
import { message } from '../ai/utils/message.utils';
import { ExtendedFixtureItem } from '../models/fixture.model';
import { FlightOffer } from '../models/flight-offer.model';

export const generateSystemMessageForPackageGeneration = (
    fixtures: ExtendedFixtureItem[],
    flightOffers: FlightOffer[],
    maxPackages: number
): CoreMessage[] => {
    const messages: CoreMessage[] = [];

    messages.push(
        message.system(
            `You are a travel assistant helping create exciting travel packages that combine soccer matches and matching flights.`
        )
    );

    fixtures.forEach((fixture) => {
        const { id, date, venue } = fixture.fixture;
        messages.push(
            message.system(
                `Fixture ${id}: ${fixture.teams.home.name} vs ${fixture.teams.away.name}, in ${venue.city} at ${venue.name}, on ${date}. League: ${fixture.league.name}, season: ${fixture.league.season}. Estimated ticket price: €${fixture.price?.min ?? '?'} - €${fixture.price?.max ?? '?'}.`
            )
        );
    });

    flightOffers.forEach((flight) => {
        const segment = flight.itineraries[0]?.segments[0];
        if (!segment) return;

        messages.push(
            message.system(
                `Flight ${flight.id}: from ${segment.departure.iataCode} to ${segment.arrival.iataCode} on ${segment.departure.at}, airline ${segment.carrierCode} ${segment.number}, price: €${flight.price.total}.`
            )
        );
    });

    messages.push(
        message.user(
            `Using the above flight offers and soccer fixtures, generate up to ${maxPackages} appealing travel packages including flights and matches. Ensure logical price and timing combinations.`
        )
    );

    return messages;
};
