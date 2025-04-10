import { Button, message, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, PushpinOutlined } from '@ant-design/icons';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import styles from './package-details-screen.module.scss';
import { formattedDate } from '@/utils/date.utils';
import { Flight, Match, PackageDocument } from '@/models/package.model';
import { FlightCard } from './FlightCard/FlightCard';
import { MatchCard } from './MatchCard/MatchCard';
import { ROUTES } from '@/constants/routes.const.ts';
import { useQuery } from '@tanstack/react-query';
import { PackageService } from '@/api/services/package.service';
import { useEffect, useState } from 'react';
import { UsersService } from '@/api/services/users.service';

const { Title, Text } = Typography;

export enum CardTypes {
    FLIGHT = 'flight',
    MATCH = 'match',
}

export const PackageDetailsScreen = () => {
    const { packageId } = useParams<{ packageId: string }>();
    const location = useLocation();
    const backRoute = (location.state as { backRoute?: string })?.backRoute || `${ROUTES.HOME}`;
    const [timelineItems, setTimelineItems] = useState<
        { type: CardTypes; date: Date; data: Flight | Match; index: number }[]
    >([]);

    const {
        data: singlePackage,
        isLoading,
        error,
    } = useQuery<PackageDocument>({
        queryKey: ['package', packageId],
        queryFn: async () => PackageService.getById(packageId!),
        enabled: !!packageId,
    });

    const { data: isPackageSaved, refetch: refetchIsPackageSaved } = useQuery({
        queryKey: ['isPackageSaved', packageId],
        queryFn: async () => {
            const result = await UsersService.getUsersSavedPackages(packageId!);
            return result.length > 0;
        },
        enabled: !!packageId && !!singlePackage?._id,
    });

    const savePackage = async () => {
        const savedPackage = await UsersService.savePackageForUser(packageId!);
        if (savedPackage) {
            message.success('Package saved successfully!');
            refetchIsPackageSaved();
        } else {
            message.error('Failed to save package.');
        }
    };

    const removePackage = async () => {
        const removedPackage = await UsersService.unsavePackageForUser(packageId!);
        if (removedPackage) {
            message.success('Package removed from saved successfully!');
            refetchIsPackageSaved();
        } else {
            message.error('Failed to remove package from saved.');
        }
    };

    useEffect(() => {
        if (singlePackage) {
            setTimelineItems(
                [
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
                ].sort((item, anotherItem) => item.date.getTime() - anotherItem.date.getTime())
            );
        }
    }, [singlePackage]);

    return (
        <div className={styles.packagePage}>
            {isLoading ? (
                <div>Loading...</div>
            ) : error || !singlePackage ? (
                <div>Package not found</div>
            ) : (
                <>
                    <div className={styles.packageHeader}>
                        <Link className={styles.backArrow} to={`/${backRoute.replace(/^\/?/, '')}`}>
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
                                    {formattedDate(singlePackage.fromDate)}{' '}
                                    <ArrowRightOutlined className={styles.arrowIcon} />
                                    {formattedDate(singlePackage.toDate)}
                                </Text>
                                <Text className={styles.packagePrice}>
                                    from <strong>{singlePackage.totalPrice?.min ?? 'N/A'}$</strong>
                                </Text>
                            </div>
                            <Button
                                type="primary"
                                className={styles.saveButton}
                                onClick={isPackageSaved ? removePackage : savePackage}
                            >
                                <PushpinOutlined /> {isPackageSaved ? 'Remove from Saved' : 'Add To Saved'}
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
                                    return (
                                        <MatchCard
                                            key={`match-${timelineIndex}`}
                                            match={match}
                                            singlePackage={singlePackage}
                                            itemIndex={item.index}
                                        />
                                    );
                                }

                                default:
                                    return null;
                            }
                        })}
                    </div>
                </>
            )}
        </div>
    );
};
