import { message, Timeline, Typography } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, PushpinOutlined } from '@ant-design/icons';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import styles from './package-details-screen.module.scss';
import { formattedDate } from '@/utils/date.utils';
import { PackageDocument, PackageTimelineItemType } from '@/models/packages/package.model.ts';
import { FlightCard } from './FlightCard/FlightCard';
import { useQuery } from '@tanstack/react-query';
import { PackageService } from '@/api/services/package.service';
import { UsersService } from '@/api/services/users.service';
import { DestinationCard } from '@pages/PackageDetailsScreen/DestinationCard';
import { useNavigate } from 'react-router';
import { PackageDetailsScreenSkeleton } from '@pages/PackageDetailsScreen/PackageDetailsScreenSkeleton';

const { Text } = Typography;

export const PackageDetailsScreen = () => {
    const { packageId } = useParams<{ packageId: string }>();
    const location = useLocation();
    const backRoute = (location.state as { backRoute?: string })?.backRoute;
    const navigate = useNavigate();

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

    if (isLoading) {
        return <PackageDetailsScreenSkeleton />;
    }

    return (
        <div className={styles.packagePage}>
            {isLoading ? (
                <div>Loading...</div>
            ) : error || !singlePackage ? (
                <div>Package not found</div>
            ) : (
                <>
                    <div className={styles.packageHeader}>
                        <div className={styles.packageInfo}>
                            <div className={styles.titleContainer}>
                                {backRoute ? (
                                    <Link className={styles.backArrow} to={`/${backRoute.replace(/^\/?/, '')}`}>
                                        <ArrowLeftOutlined className={styles.backIcon} />
                                    </Link>
                                ) : (
                                    <div className={styles.backArrow} onClick={() => navigate(-1)}>
                                        <ArrowLeftOutlined className={styles.backIcon} />
                                    </div>
                                )}
                                <h1 className={styles.packageTitle}>{singlePackage.title}</h1>
                            </div>
                            <Text className={styles.packageDescription}>{singlePackage.description}</Text>
                        </div>

                        <div className={styles.packageDetails}>
                            <div className={styles.packageDetailsContainer}>
                                <Text className={styles.packageDate}>
                                    <Calendar className={styles.calendarIcon} />
                                    {formattedDate(singlePackage.startDate)}{' '}
                                    <ArrowRightOutlined className={styles.arrowIcon} />
                                    {formattedDate(singlePackage.endDate)}
                                </Text>
                                <Text className={styles.packagePrice}>
                                    from <strong>{singlePackage.totalPrice?.min ?? 'N/A'}$</strong>
                                </Text>
                            </div>
                            <button
                                className={styles.saveButton}
                                onClick={isPackageSaved ? removePackage : savePackage}
                            >
                                <PushpinOutlined />
                                {isPackageSaved ? 'Remove From Saved' : 'Add To Saved'}
                            </button>
                        </div>
                    </div>

                    <div className={styles.cardsSection}>
                        <Timeline className={styles.cardsSection}>
                            {singlePackage.timeline.map((item, timelineIndex) => {
                                switch (item.type) {
                                    case PackageTimelineItemType.FLIGHT: {
                                        return (
                                            <Timeline.Item className={styles.timelineItem}>
                                                <FlightCard key={`flight-${timelineIndex}`} flight={item} />
                                            </Timeline.Item>
                                        );
                                    }

                                    case PackageTimelineItemType.DESTINATION:
                                        return (
                                            <Timeline.Item className={styles.timelineItem}>
                                                <DestinationCard
                                                    key={`destination-${timelineIndex}`}
                                                    destination={item}
                                                />
                                            </Timeline.Item>
                                        );

                                    default:
                                        return null;
                                }
                            })}
                        </Timeline>
                    </div>
                </>
            )}
        </div>
    );
};
