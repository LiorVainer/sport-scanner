import mongoose, { Document, Schema } from 'mongoose';
import { PackageWithMetadata } from '../models/packages/package.model';
import { PriceRange } from '../models/price-range.model';

const PriceRangeSchema = new Schema<PriceRange>(
    {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
    },
    { _id: false }
);

export const PackageSchema = new Schema<
    Omit<PackageWithMetadata, 'id' | 'timeline' | 'metadata'> & {
        timeline: any;
        metadata: any;
    }
>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: { type: String, required: true },
        location: { type: String, required: true },
        flightsPrice: { type: Number, required: true },
        matchesPrice: { type: PriceRangeSchema, required: true },
        totalPrice: { type: PriceRangeSchema, required: true },
        timeline: {
            type: [Schema.Types.Mixed],
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            required: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);

export const PackageRepository = mongoose.model<Omit<PackageWithMetadata, 'id'>>('Packages', PackageSchema);

export type PackageDocument = Document<unknown, {}, Omit<PackageWithMetadata, 'id'>>;
