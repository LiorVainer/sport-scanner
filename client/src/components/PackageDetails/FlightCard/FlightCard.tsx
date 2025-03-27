import React from 'react';
import FlightLabel from './FlightLabel';
import FlightDetails from './FlightDetails';
import styles from './scss/flight-card.module.scss';

interface FlightCardProps {
    label: string;
    from: string;
    to: string;
    departureDate: string;
    price: number;
}

const FlightCard = ({ label, from, to, departureDate, price }: FlightCardProps) => (
    <div className={styles['flight-card-container']}>
        <FlightLabel label={label} from={from} to={to} />
        <FlightDetails from={from} to={to} departureDate={departureDate} price={price} />
    </div>
);

export default FlightCard;
