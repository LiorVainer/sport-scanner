import { Button, message, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, PushpinOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router';
import { Calendar } from 'lucide-react';
import styles from './package-details-screen.module.scss';
import { formattedDate } from '@/utils/date.utils';
import { Flight, Match, Package } from '@/models/package.model';
import { FlightCard } from './FlightCard/FlightCard';
import { MatchCard } from './MatchCard/MatchCard';
import { ROUTES } from '@/constants/routes.const.ts';
import { SavedPackageService } from '@/api/services/saved-package.service';

const { Title, Text } = Typography;

export enum CardTypes {
    FLIGHT = 'flight',
    MATCH = 'match',
}

export const PackageDetailsScreen = () => {
    const location = useLocation();
    const { singlePackage, packageId } = (location.state as { singlePackage: Package; packageId: string }) || {};

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
    ].sort((item, anotherItem) => item.date.getTime() - anotherItem.date.getTime());

    const savePackage = async () => {
        const savedPackage = await SavedPackageService.savePackage(packageId);
        if (savedPackage) {
            message.success('Package saved successfully!');
        } else {
            message.error('Failed to save package.');
        }
    };

    return (
        <div className={styles.packagePage}>
            <div className={styles.packageHeader}>
                <Link className={styles.backArrow} to={`${ROUTES.PACKAGES}/results`}>
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
                            {formattedDate(singlePackage.fromDate)} <ArrowRightOutlined className={styles.arrowIcon} />
                            {formattedDate(singlePackage.toDate)}
                        </Text>
                        <Text className={styles.packagePrice}>
                            from <strong>{singlePackage.totalPrice.min}$</strong>
                        </Text>
                    </div>
                    <Button type="primary" className={styles.saveButton} onClick={savePackage}>
                        <PushpinOutlined /> Add To Saved
                    </Button>
                </div>
            </div>

            <div className={styles.cardsSection}>
                {timelineItems.map((item, timelineIndex) => {
                    switch (item.type) {
                        case CardTypes.FLIGHT: {
                            const flight = item.data as Flight;
                            return (
                                <FlightCard
                                    key={`flight-${timelineIndex}`}
                                    flight={flight}
                                    itemIndex={item.index}
                                    totalFlights={singlePackage.flights.length}
                                />
                            );
                        }

                        case CardTypes.MATCH: {
                            const match = item.data as Match;
                            return <MatchCard match={match} singlePackage={singlePackage} itemIndex={item.index} />;
                        }

                        default:
                            return null;
                    }
                })}
            </div>
        </div>
    );
};
