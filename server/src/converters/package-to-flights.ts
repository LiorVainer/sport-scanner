import { FlightSearchParams } from '../models/flights.model';
import {PackageGenerateParams} from "../models/package-generate-params.model";

export const convertPackageGenerateParamsToFlightSearchParams = (
    params: PackageGenerateParams
): FlightSearchParams => {
    return {
        origin: params.country ?? 'TLV', // fallback or dynamic logic
        destination: params.country ?? 'TLV',
        dateFrom: params.date?.from
            ? new Date(params.date.from).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        dateTo: params.date?.to
            ? new Date(params.date.to).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        minPrice: params.price?.min,
        maxPrice: params.price?.max,
        adults: 1,
    };
};
