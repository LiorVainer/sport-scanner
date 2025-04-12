import {FlightPurposeEnum} from "@/models/packages/package.model.ts";
import {ValueOf} from "@/types/common.types.ts";

export const FlightPurposeToFlightLabelMap = {
    [FlightPurposeEnum.departure]: 'Departure',
    [FlightPurposeEnum.connecting]: 'Connecting',
    [FlightPurposeEnum.return]: 'Return',
} satisfies Record<ValueOf<typeof FlightPurposeEnum>, string>