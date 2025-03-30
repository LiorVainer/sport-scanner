import styles from './flight-card.module.scss';
import { Flight } from '@/models/package.model';
import { FlightLabel } from './FlightLabel/FlightLabel';
import { FlightDetails } from './FlightDetails/FlightDetails';

interface FlightCardProps {
    flight: Flight;
    itemIndex: number;
    totalFlights: number;
}

export const FlightCard = ({ flight, itemIndex, totalFlights }: FlightCardProps) => {
    const {
        origin: { iataCode: originCode, name: originName },
        destination: { iataCode: destinationCode, name: destinationName },
        departureDate,
        price,
        searchFlightTicketsLink,
    } = flight;

    const getFlightLabel = (index: number, total: number): string => {
        switch (index) {
            case 0:
                return 'Departure Flight';
            case total - 1:
                return 'Return Flight';
            default:
                return 'Connecting Flight';
        }
    };

    return (
        <div className={styles.flightCardContainer}>
            <FlightLabel label={getFlightLabel(itemIndex, totalFlights)} from={originName} to={destinationName} />
            <FlightDetails
                from={originCode}
                to={destinationCode}
                departureDate={departureDate}
                price={price}
                linkForTicket={searchFlightTicketsLink}
            />
        </div>
    );
};
