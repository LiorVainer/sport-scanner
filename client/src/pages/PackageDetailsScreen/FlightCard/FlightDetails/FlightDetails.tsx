import { Typography, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './flight-details.module.scss';
import { formattedDate } from '@/utils/date.utils';
import { TicketsPlane } from 'lucide-react';

const { Text } = Typography;

interface FlightDetailsProps {
    from: string;
    to: string;
    departureDate: string;
    price: number;
    linkForTicket: string;
}

export const FlightDetails = ({ from, to, departureDate, price, linkForTicket }: FlightDetailsProps) => {
    return (
        <div className={styles.flightDetailsContainer}>
            <div className={styles.flightRouteInfo}>
                <TicketsPlane className={styles.airplaneIcon} />
                <Text strong className={styles.flightRoute}>
                    {from}<ArrowRightOutlined className={styles.arrowIcon} />{to}
                </Text>
                <Text type="secondary" className={styles.flightDate}>
                    ({formattedDate(departureDate)})
                </Text>
            </div>
            <div className={styles.flightPriceInfo}>
                <div className={styles.priceContainer}>
                    <Text className={styles.priceText}>from:</Text>
                    <Text strong className={styles.priceAmount}>
                        {price}$
                    </Text>
                </div>
                <a href={linkForTicket} target="_blank" rel="noopener noreferrer">
                    <Button type="primary" className={styles.flightTicketButton}>
                        Flight Tickets
                    </Button>
                </a>
            </div>
        </div>
    );
};