import mongoose, { Document, Schema } from 'mongoose';
import { CityInfo, Match, Package, Team } from '../models/package.model';
import { PriceRange } from '../models/price-range.model';

const PriceRangeSchema = new Schema<PriceRange>(
    {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
    },
    { _id: false }
);

const CityInfoSchema = new Schema<CityInfo>(
    {
        name: { type: String, required: true },
        iataCode: { type: String, required: true },
    },
    { _id: false }
);

const TeamSchema = new Schema<Team>(
    {
        id: { type: Number, required: true },
        name: { type: String, required: true },
        logo: { type: String, required: true },
    },
    { _id: false }
);

const MatchSchema = new Schema<Match>(
    {
        id: { type: Number, required: true },
        homeTeam: { type: TeamSchema, required: true },
        awayTeam: { type: TeamSchema, required: true },
        league: { type: String, required: true },
        city: { type: String, required: true },
        cityIataCode: { type: String, required: true },
        stadium: { type: String, required: true },
        date: { type: String, required: true },
        price: { type: PriceRangeSchema, required: true },
        searchMatchTicketsLink: { type: String, required: true },
    },
    { _id: false }
);

// Timeline discriminated union (flight | destination)

const FlightItemSchema = new Schema(
    {
        type: { type: String, enum: ['flight'], required: true },
        id: { type: Number, required: true },
        origin: { type: CityInfoSchema, required: true },
        destination: { type: CityInfoSchema, required: true },
        price: { type: Number, required: true },
        departureDate: { type: String, required: true },
        purpose: {
            type: String,
            enum: ['departure', 'return', 'connecting'],
            required: true,
        },
        searchFlightTicketsLink: { type: String, required: true },
    },
    { _id: false }
);

const DestinationSchema = new Schema(
    {
        type: { type: String, enum: ['destination'], required: true },
        city: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: { type: String, required: true },
        matches: { type: [MatchSchema], required: true },
    },
    { _id: false }
);

export const PackageSchema = new Schema<Omit<Package, 'id' | 'timeline'> & { timeline: any }>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        fromDate: { type: String, required: true },
        toDate: { type: String, required: true },
        location: { type: String, required: true },
        flightsPrice: { type: Number, required: true },
        matchesPrice: { type: PriceRangeSchema, required: true },
        totalPrice: { type: PriceRangeSchema, required: true },
        timeline: {
            type: [Schema.Types.Mixed],
            required: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);

export const PackageRepository = mongoose.model<Omit<Package, 'id'>>('packages', PackageSchema);

export type PackageDocument = Document<unknown, {}, Omit<Package, 'id'>>;
