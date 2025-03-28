import { CoreMessage } from 'ai';
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
            `You are a travel assistant helping create exciting travel packages that combine soccer matches and available flights. Each package should include: flight details (full segments), match info, and total cost breakdown.`
        )
    );

    fixtures.forEach((fixture) => {
        const { id, date, venue } = fixture.fixture;
        const priceRange = fixture.price
            ? `Estimated ticket price: €${fixture.price.min} - €${fixture.price.max}`
            : `Ticket price is unknown`;

        messages.push(
            message.system(
                `Match ID ${id}: ${fixture.teams.home.name} vs ${fixture.teams.away.name}, league ${fixture.league.name} (${fixture.league.country}) season ${fixture.league.season}. Date: ${date}. Venue: ${venue.name}, ${venue.city}. ${priceRange}.`
            )
        );
    });

    flightOffers.forEach((flight) => {
        const segments = flight.itineraries
            .flatMap((itinerary) => itinerary.segments)
            .map((seg) => {
                return `Segment ${seg.id}: ${seg.departure.iataCode} -> ${seg.arrival.iataCode} | Departure: ${seg.departure.at} | Arrival: ${seg.arrival.at} | Airline: ${seg.carrierCode}${seg.number} | Duration: ${seg.duration}`;
            })
            .join('\n');

        messages.push(
            message.system(
                `Flight Offer ${flight.id}: Total Price: €${flight.price.total}, Currency: ${flight.price.currency}, One Way: ${flight.oneWay}, Bookable Seats: ${flight.numberOfBookableSeats}\n${segments}`
            )
        );
    });

    messages.push(
        message.user(
            `Generate a maximum of ${maxPackages} tailored travel packages that combine the above flight options and matches. Make sure each package makes sense in terms of timing and total cost. Each package should contain: title, description, flights, matches, total flight price, total match price, and travel window.`
        )
    );

    return messages;
};
