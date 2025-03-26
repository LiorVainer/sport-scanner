import Amadeus, {FlightOffer} from 'amadeus-ts';
import { ENV } from '../env/env.config';
import { FlightSearchParams, FlightSearchParamsSchema } from '../models/flights.model';

const AmadeusClient = new Amadeus({
    clientId: ENV?.AMADEUS_API_KEY,
    clientSecret: ENV?.AMADEUS_API_SECRET,
});

export const AmadeusService = {
    searchFlights: async (params: FlightSearchParams) => {
        const valid = FlightSearchParamsSchema.parse(params);
        const dates = getDateRange(valid.dateFrom, valid.dateTo);

        const results = await Promise.allSettled(
            dates.map(date =>
                AmadeusClient.shopping.flightOffersSearch.get({
                    originLocationCode: valid.origin,
                    destinationLocationCode: valid.destination,
                    departureDate: date,
                    adults: valid.adults,
                    currencyCode: 'EUR',
                    maxPrice: valid.maxPrice,
                })
            )
        );

        results.forEach((res, i) => {
            if (res.status === 'rejected') {
                console.error(`Flight search failed for ${dates[i]}:`, res.reason);
            }
        });

        return results
            .flatMap(r => (r.status === 'fulfilled' ? r.value.data : []))
            .filter(o => {
                const price = parseFloat(o.price.total);
                return valid.minPrice ? price >= valid.minPrice : true;
            });
    },

    priceFlight: async (offer: FlightOffer) => {
        return await AmadeusClient.shopping.flightOffers.pricing.post({
            data: {
                type: 'flight-offers-pricing',
                flightOffers: [offer],
            },
        });
    },
};

function getDateRange(from: string, to: string): string[] {
    const dates: string[] = [];
    const start = new Date(from);
    const end = new Date(to);
    while (start <= end) {
        dates.push(start.toISOString().split('T')[0]);
        start.setDate(start.getDate() + 1);
    }
    return dates;
}
