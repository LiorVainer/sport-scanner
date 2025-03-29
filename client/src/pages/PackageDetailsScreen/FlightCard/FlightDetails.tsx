import React from 'react';
import { Typography, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './scss/flight-details.module.scss';
import { formattedDate } from '@/utils/date.utils';

const { Text } = Typography;

interface FlightDetailsProps {
    from: string;
    to: string;
    departureDate: string;
    price: number;
    linkForTicket: string;
}

const FlightDetails = ({ from, to, departureDate, price,linkForTicket }: FlightDetailsProps) => {
    return (
        <div className={styles['flight-details-container']}>
            <div className={styles['flight-route-info']}>
                <img src="../public/flight.png" alt="flight" className={styles['airplane-icon']} />
                <Text strong className={styles['flight-route']}>
                    {from} <ArrowRightOutlined className={styles['arrow-icon']} />
                    {to}
                </Text>
                <Text type="secondary" className={styles['flight-date']}>
                    ({formattedDate(departureDate)})
                </Text>
            </div>
            <div className={styles['flight-price-info']}>
                <div className={styles['price-container']}>
                    <Text className={styles['price-text']}>from</Text>
                    <Text strong className={styles['price-amount']}>{price}$</Text> {/* add currency */}
                </div>
                <a href={linkForTicket} target="_blank" rel="noopener noreferrer">
                    <Button type="primary" className={styles['flight-ticket-button']}>
                    Flight Tickets
                    </Button>
                </a>
            </div>
        </div>
    );
};

export default FlightDetails;
