import { Typography, Button } from 'antd';
import { CalendarOutlined, PushpinOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import packageData from './packageData.json';
import { useParams } from 'react-router';
import styles from './package-details.module.scss';
import FlightCard from './FlightCard/FlightCard';
import MatchCard from './MatchCard/MatchCard';
import { formattedDate } from '@/utils/date.utils';

const { Title, Text } = Typography;

export const PackageDetails = () => {
    const { id: packageId } = useParams();
    const pkg = packageData.find((pkg) => pkg.id.toString() === packageId);

    if (!pkg) return <div>Package not found</div>;

    const totalPrice = pkg.flights_price + pkg.matches_price;

    const flightLabels = ['First Flight', 'Connecting Flight', 'Last Flight'];
    const destinationLabels = ['First Destination', 'Second Destination'];

    return (
        <div className={styles["package-page"]}>
            {/* Header Section */}
            <div className={styles["package-header"]}>
                <ArrowLeftOutlined className={styles["back-icon"]} />
                <div className={styles["package-info"]}>
                    <div>
                        <Title level={3} className={styles["package-title"]}>
                            {pkg.title}
                        </Title>
                    </div>
                    <div>
                        <Text className={styles["package-description"]}>
                            {pkg.description}
                        </Text>
                    </div>
                </div>
                <div className={styles["package-details"]}>
                    <div className={styles['package-details-container']}>
                        <Text className={styles["package-date"]}>
                            <CalendarOutlined className={styles["calendar-icon"]} /> {formattedDate(pkg.from)} <ArrowRightOutlined className={styles['arrow-icon']} />{' '}
                            {formattedDate(pkg.to)}
                        </Text>
                        <Text className={styles["package-price"]}>
                            <em>from <strong>{totalPrice}$</strong></em>
                        </Text>
                    </div>
                    <Button type="primary" className={styles["save-button"]}>
                        <PushpinOutlined /> Add To Saved
                    </Button>
                </div>
            </div>

            {/* Flights & Matches */}
            {pkg.flights.map((flight, index) => (
                <div key={flight.id} className={styles["section-block"]}>
                    <FlightCard
                        label={flightLabels[index] || 'Flight'}
                        from={flight.from}
                        to={flight.to}
                        departureDate={flight.departureDate}
                        price={flight.price}
                    />
                    {/* Show match if it exists after this flight */}
                    {pkg.matches[index] && (
                        <div className={styles["destination-block"]}>
                            <MatchCard
                                homeTeam={pkg.matches[index].home_team}
                                awayTeam={pkg.matches[index].away_team}
                                matchDate={pkg.matches[index].matchDate}
                                departureDate="2022-12-12" // placeholder
                                stadium={pkg.matches[index].stadium}
                                league={pkg.matches[index].league}
                                price={pkg.matches[index].price}
                                imagePath={`../../../public/thefortrest.png`}
                                label={destinationLabels[index] || 'Destination'}
                                location={pkg.matches[index].location}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PackageDetails;
