import mongoose, { Document, Schema } from 'mongoose';
import { Package, CityInfo, Flight, Match, Team } from '../models/package.model';
import { PriceRange } from '../models/price-range.model';
import { SavedPackage } from '../models/saved-packages.model';

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
        iataCode: { type: String, required: true, length: 3 },
    },
    { _id: false }
);

const FlightSchema = new Schema<Flight>(
    {
        id: { type: Number, required: true },
        origin: { type: CityInfoSchema, required: true },
        destination: { type: CityInfoSchema, required: true },
        price: { type: Number, required: true },
        departureDate: { type: String, required: true },
        searchFlightTicketsLink: { type: String, required: true },
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

export const PackageSchema = new Schema<Package>(
    {
        id: { type: Number, required: true, unique: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        fromDate: { type: String, required: true },
        toDate: { type: String, required: true },
        location: { type: String, required: true },
        flightsPrice: { type: Number, required: true },
        matchesPrice: { type: PriceRangeSchema, required: true },
        totalPrice: { type: PriceRangeSchema, required: true },
        flights: { type: [FlightSchema], required: true },
        matches: { type: [MatchSchema], required: true },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);

const savedPackagesSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        package: { type: PackageSchema, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: true } }
);

export const SavedPackageRepository = mongoose.model<Package>('savedPackages', savedPackagesSchema);

export type SavedPackageDocument = Document<unknown, {}, SavedPackage> &
    SavedPackage & {
        __v: number;
    };
