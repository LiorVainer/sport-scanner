import styles from './flight-card.module.scss';
import { Flight } from '@/models/packages/package.model.ts';
import { FlightLabel } from './FlightLabel/FlightLabel';
import { FlightDetails } from './FlightDetails/FlightDetails';

interface FlightCardProps {
    flight: Flight;
}

export const FlightCard = ({ flight }: FlightCardProps) => (
    <div className={styles.flightCardContainer}>
        <FlightLabel flight={flight} />
        <FlightDetails flight={flight} />
    </div>
);
