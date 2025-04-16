import { z } from 'zod';

export const FlightOfferSchema = z
    .object({
        type: z.literal('flight-offer'),
        id: z.string(),
        source: z.string(),
        oneWay: z.boolean(),
        numberOfBookableSeats: z.number(),
        itineraries: z.array(
            z.object({
                duration: z.string(),
                segments: z.array(
                    z.object({
                        departure: z.object({
                            iataCode: z.string(),
                            at: z.string(),
                        }),
                        arrival: z.object({
                            iataCode: z.string(),
                            at: z.string(),
                        }),
                        carrierCode: z.string(),
                        number: z.string(),
                        duration: z.string(),
                        id: z.string(),
                    })
                ),
            })
        ),
        price: z.object({
            currency: z.string(),
            total: z.string(),
        }),
    })
    .strip();

export const FlightOffersArraySchema = z.array(FlightOfferSchema);

export type FlightOffer = z.infer<typeof FlightOfferSchema>;
export type FlightOffersArray = z.infer<typeof FlightOffersArraySchema>;
