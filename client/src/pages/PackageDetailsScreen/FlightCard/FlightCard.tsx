import React from 'react';
import FlightLabel from './FlightLabel';
import FlightDetails from './FlightDetails';
import styles from './scss/flight-card.module.scss';

interface FlightCardProps {
    label: string;
    originName: string;
    originCode: string;
    destinationName: string;
    destinationCode: string;
    departureDate: string;
    price: number;
    linkForTicket: string;
}

const FlightCard = ({ label, originName, originCode,destinationName,destinationCode, departureDate, price,linkForTicket }: FlightCardProps) => (
    <div className={styles['flight-card-container']}>
        <FlightLabel label={label} from={originName} to={destinationName} />
        <FlightDetails from={originCode} to={destinationCode} departureDate={departureDate} price={price} linkForTicket={linkForTicket} />
    </div>
);

export default FlightCard;
