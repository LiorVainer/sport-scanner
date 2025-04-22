import { FlightOffer } from '../../models/flights/flight-offer.model';
import { CoreMessage } from 'ai';
import { message } from './utils/message.utils';
import { ExtendedFixtureItem } from '../../models/soccer/fixture.model';

const getFlightPurpose = (origin: string, destination: string, userOrigin: string, matchCities: string[]): string => {
    const isFromOrigin = origin === userOrigin;
    const isToOrigin = destination === userOrigin;
    const isToMatch = matchCities.includes(destination);
    const isFromMatch = matchCities.includes(origin);

    if (isFromOrigin && isToMatch) return '→ To match city';
    if (isFromMatch && isToOrigin) return '→ Back to origin';
    if (isFromMatch && isToMatch) return '→ Between match cities';
    return '';
};

const FlightMessageParser = {
    summaryLine: (flight: FlightOffer): string =>
        `✈️ Flight Offer ${flight.id}: ${flight.price.total} ${flight.price.currency} | OneWay: ${flight.oneWay}`,

    purposeSegments: (flight: FlightOffer, matchCities: string[], userOrigin: string): string =>
        flight.itineraries
            .flatMap((itinerary) =>
                itinerary.segments.map((seg) => {
                    const purpose = getFlightPurpose(
                        seg.departure.iataCode,
                        seg.arrival.iataCode,
                        userOrigin,
                        matchCities
                    );
                    return `  - ${seg.departure.iataCode} → ${seg.arrival.iataCode} on ${seg.departure.at} ${purpose}`;
                })
            )
            .join('\n'),

    segmentDetails: (flight: FlightOffer): string =>
        flight.itineraries
            .map((itinerary, idx) => {
                const segments = itinerary.segments
                    .map(
                        (seg) =>
                            `  - ${seg.departure.iataCode} → ${seg.arrival.iataCode} at ${seg.departure.at} (${seg.duration})`
                    )
                    .join('\n');
                return `Itinerary ${idx + 1}:\n${segments}`;
            })
            .join('\n\n'),

    directionLabel: (flight: FlightOffer): string => (flight.oneWay ? 'one-way' : 'round-trip'),

    segmentCount: (flight: FlightOffer): number => flight.itineraries.reduce((sum, i) => sum + i.segments.length, 0),
};

export const FlightContextMessageGenerator = {
    create: (flight: FlightOffer, matchCities: string[], userOrigin: string): CoreMessage =>
        message.system(
            [
                FlightMessageParser.summaryLine(flight),
                FlightMessageParser.purposeSegments(flight, matchCities, userOrigin),
            ].join('\n')
        ),

    json: (flight: FlightOffer): CoreMessage => message.system(JSON.stringify(flight, null, 2)),

    context: (flight: FlightOffer): CoreMessage => {
        const direction = FlightMessageParser.directionLabel(flight);
        const segments = FlightMessageParser.segmentCount(flight);

        return message.system(
            `✈️ This is a ${direction} flight offer with ${segments} segment${segments !== 1 ? 's' : ''}.
Each segment includes origin, destination, carrier, and time metadata.
⚠️ Use the full offer as a single timeline item — do NOT split segments.`
        );
    },

    itemsArrayIntro: (): CoreMessage =>
        message.system(
            `✈️ The following is a list of complete flight offers.
Each offer may contain one or more segments and may be one-way or round-trip (see the \`oneWay\` field).
⚠️ Each offer must be used as a whole in the timeline. Do NOT split segments into individual flights.`
        ),

    itemsArray: (flights: FlightOffer[], fixtures: ExtendedFixtureItem[], originIataCode: string): CoreMessage[] => {
        const matchCities = fixtures.map((f) => f.fixture.venue.city?.toUpperCase().trim());

        return flights.map((flight) => FlightContextMessageGenerator.create(flight, matchCities, originIataCode));
    },
};
