import { Typography } from 'antd';
import { ArrowRightOutlined, ExportOutlined } from '@ant-design/icons';
import styles from './flight-details.module.scss';
import { formattedDate } from '@/utils/date.utils';
import { TicketsPlane } from 'lucide-react';
import { Flight } from '@/models/packages/package.model.ts';

const { Text } = Typography;

interface FlightDetailsProps {
    flight: Flight;
}

export const FlightDetails = ({ flight }: FlightDetailsProps) => {
    const {
        origin: { name: originName, iataCode: originIataCode },
        destination: { name: destinationName, iataCode: destinationIataCode },
        departureDate,
        price,
        searchFlightTicketsLink,
    } = flight;

    return (
        <div className={styles.flightDetailsContainer}>
            <div className={styles.flightRouteInfo}>
                <div className={styles.flightRouteSection}>
                    <TicketsPlane className={styles.airplaneIcon} />
                    <div className={styles.flightRoute}>
                        <p>
                            {originName} ({originIataCode})
                        </p>
                        <ArrowRightOutlined className={styles.arrowIcon} />
                        <p>
                            {destinationName} ({destinationIataCode})
                        </p>
                    </div>
                </div>
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
                    <button className={styles.flightTicketButton}>
                        <ExportOutlined />
                        Flight Tickets
                    </button>
                </a>
            </div>
        </div>
    );
};
