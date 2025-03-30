import { Typography, Button } from 'antd';
import { PushpinOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router';
import { Calendar } from 'lucide-react';
import styles from './package-details-screen.module.scss';
import { formattedDate } from '@/utils/date.utils';
import { ROUTES } from '@/constants/routes.const';
import { Flight, Match, Package } from '@/models/package.model';
import { FlightCard } from './FlightCard/FlightCard';
import { MatchCard } from './MatchCard/MatchCard';

const { Title, Text } = Typography;

export enum CardTypes {
    FLIGHT = 'flight',
    MATCH = 'match',
}

export const PackageDetailsScreen = () => {
    const location = useLocation();
    const singlePackage: Package = location.state;

    if (!singlePackage) return <div>Package not found</div>;

    const timelineItems = [
        ...singlePackage.flights.map((flight: Flight, index: number) => ({
            type: CardTypes.FLIGHT,
            date: new Date(flight.departureDate),
            data: flight,
            index,
        })),
        ...singlePackage.matches.map((match: Match, index: number) => ({
            type: CardTypes.MATCH,
            date: new Date(match.date),
            data: match,
            index,
        })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    return (
        <div className={styles.packagePage}>
            <div className={styles.packageHeader}>
                <Link to={`${ROUTES.PACKAGES}/results`}>
                    <ArrowLeftOutlined className={styles.backIcon} />
                </Link>

                <div className={styles.packageInfo}>
                    <Title className={styles.packageTitle}>{singlePackage.title}</Title>
                    <Text className={styles.packageDescription}>{singlePackage.description}</Text>
                </div>

                <div className={styles.packageDetails}>
                    <div className={styles.packageDetailsContainer}>
                        <Text className={styles.packageDate}>
                            <Calendar className={styles.calendarIcon} />
                            {formattedDate(singlePackage.fromDate)} <ArrowRightOutlined className={styles.arrowIcon} />{' '}
                            {formattedDate(singlePackage.toDate)}
                        </Text>
                        <Text className={styles.packagePrice}>
                            <em>
                                from: <strong>{singlePackage.totalPrice.min}$</strong>
                            </em>
                        </Text>
                    </div>
                    <Button type="primary" className={styles.saveButton}>
                        <PushpinOutlined /> Add To Saved
                    </Button>
                </div>
            </div>

            {timelineItems.map((item, timelineIndex) => {
                switch (item.type) {
                    case CardTypes.FLIGHT: {
                        const flight = item.data as Flight;
                        return (
                            <div key={`flight-${timelineIndex}`}>
                                <FlightCard
                                    flight={flight}
                                    itemIndex={item.index}
                                    totalFlights={singlePackage.flights.length}
                                />
                            </div>
                        );
                    }

                    case CardTypes.MATCH: {
                        const match = item.data as Match;
                        return (
                            <div key={`match-${timelineIndex}`}>
                                <MatchCard match={match} singlePackage={singlePackage} itemIndex={item.index} />
                            </div>
                        );
                    }

                    default:
                        return null;
                }
            })}
        </div>
    );
};
