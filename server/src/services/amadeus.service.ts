import Amadeus, {CurrencyCode, FlightOffer as RawFlightOffer, FlightOffersSearchPostParams} from 'amadeus-ts';
import {ENV} from '../env/env.config';
import {FlightSearchParams, FlightSearchParamsSchema} from '../models/flights-search-params.model';
import {FlightOffer, FlightOffersArraySchema} from '../models/flight-offer.model';
import {CitySearchParams} from '../models/geo.model';

const AmadeusClient = new Amadeus({
    clientId: ENV?.AMADEUS_API_KEY,
    clientSecret: ENV?.AMADEUS_API_SECRET,
});

export const AmadeusService = {
    searchFlights: async (params: FlightSearchParams) => {
        const validatedParams = FlightSearchParamsSchema.parse(params);
        const postReqParams: FlightOffersSearchPostParams = AmadeusService.buildFlightSearchRequest(validatedParams);

        const {data} = await AmadeusClient.shopping.flightOffersSearch.post(postReqParams);

        return FlightOffersArraySchema.optional().parse(data);
    },

    priceFlight: async (offer: RawFlightOffer) => {
        return await AmadeusClient.shopping.flightOffers.pricing.post({
            data: {
                type: 'flight-offers-pricing',
                flightOffers: [offer],
            },
        });
    },

    getIATACodeByCity: async (city: string): Promise<string | null> => {
        try {
            const res = await AmadeusClient.referenceData.locations.get({
                keyword: city,
                subType: 'AIRPORT',
            });

            return res.data?.at(0)?.iataCode ?? null;
        } catch (err) {
            console.error(`Failed to get IATA code for city: ${city}`, err);
            return null;
        }
    },

    buildFlightSearchRequest: (params: FlightSearchParams): FlightOffersSearchPostParams => ({
        originDestinations: [
            {
                id: '1',
                originLocationCode: params.origin,
                destinationLocationCode: params.destination,
                departureDateTimeRange: {
                    date: params.dateFrom,
                },
            },
            {
                id: '2',
                originLocationCode: params.destination,
                destinationLocationCode: params.origin,
                departureDateTimeRange: {
                    date: params.dateTo,
                },
            },
        ],
        travelers: [
            {
                id: '1',
                travelerType: 'ADULT',
            },
        ],
        sources: ['GDS'],
        currencyCode: ENV.CURRENCY_CODE as CurrencyCode,
        searchCriteria: {
            maxPrice: params.maxPrice,
            maxFlightOffers: ENV.MAX_FLIGHT_OFFERS_PER_FIXTURE,
            flightFilters: {
                returnToDepartureAirport: true,
            },
        },
    }),

    findPriceRange: (offers: FlightOffer[]) => {
        if (!offers.length) {
            return {min: null, max: null};
        }

        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        for (const offer of offers) {
            const price = parseFloat(offer.price.total);
            if (!isNaN(price)) {
                if (price < min) min = price;
                if (price > max) max = price;
            }
        }

        return {
            min: min === Number.POSITIVE_INFINITY ? null : min,
            max: max === Number.NEGATIVE_INFINITY ? null : max,
        };
    },

    getCities: async ({countryCode, keyword}: CitySearchParams) => {
        try {
            const {data} = await AmadeusClient.referenceData.locations.cities.get({
                keyword,
                countryCode,
            });

            return data;
        } catch (err) {
            console.error(`Failed to get airports for keyword: ${keyword}`, err);
            return [];
        }
    }
};
