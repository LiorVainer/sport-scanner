import { FlightPurposeEnum } from '@/models/packages/package.model.ts';
import { ValueOf } from '@/types/common.types.ts';
import { Shuffle } from 'lucide-react';
import { ReactNode } from 'react';
import { faPlaneArrival, faPlaneDeparture } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const FlightPurposeToFlightLabelMap = {
    [FlightPurposeEnum.departure]: 'Departure',
    [FlightPurposeEnum.connecting]: 'Connecting',
    [FlightPurposeEnum.return]: 'Return',
} satisfies Record<ValueOf<typeof FlightPurposeEnum>, string>;

const ICON_SIZE = 20;

export const FlightPurposeToIcon = {
    [FlightPurposeEnum.departure]: <FontAwesomeIcon icon={faPlaneDeparture} />,
    [FlightPurposeEnum.connecting]: <Shuffle size={ICON_SIZE} />,
    [FlightPurposeEnum.return]: <FontAwesomeIcon icon={faPlaneArrival} />,
} satisfies Record<ValueOf<typeof FlightPurposeEnum>, ReactNode>;
