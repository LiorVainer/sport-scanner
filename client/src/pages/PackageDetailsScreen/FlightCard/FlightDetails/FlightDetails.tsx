import { Button, Typography } from 'antd';
import { ArrowRightOutlined, ExportOutlined } from '@ant-design/icons';
import styles from './flight-details.module.scss';
import { formattedDate } from '@/utils/date.utils';
import { TicketsPlane } from 'lucide-react';
import { Flight } from '@/models/packages/package.model.ts';
import React from 'react';

const { Text } = Typography;

interface FlightDetailsProps {
    flight: Flight;
}

export const FlightDetails = ({ flight }: FlightDetailsProps) => {
    const {
        origin: { name: originName },
        destination: { name: destinationName },
        departureDate,
        price,
        searchFlightTicketsLink,
    } = flight;

    return (
        <div className={styles.flightDetailsContainer}>
            <div className={styles.flightRouteInfo}>
                <TicketsPlane className={styles.airplaneIcon} />
                <Text strong className={styles.flightRoute}>
                    {originName}
                    <ArrowRightOutlined className={styles.arrowIcon} />
                    {destinationName}
                </Text>
                <Text type="secondary" className={styles.flightDate}>
                    ({formattedDate(departureDate)})
                </Text>
            </div>
            <div className={styles.flightPriceInfo}>
                <div className={styles.priceContainer}>
                    <Text className={styles.priceText}>from</Text>
                    <Text strong className={styles.priceAmount}>
                        {price}$
                    </Text>
                </div>
                <a href={searchFlightTicketsLink} target="_blank" rel="noopener noreferrer">
                    <Button
                        type="primary"
                        color={'purple'}
                        icon={<ExportOutlined />}
                        className={styles.flightTicketButton}
                    >
                        Flight Tickets
                    </Button>
                </a>
            </div>
        </div>
    );
};
