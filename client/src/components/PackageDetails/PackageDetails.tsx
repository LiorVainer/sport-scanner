import { Typography, Button, Divider } from 'antd';
import packageData from './packageData.json';
import { useParams } from 'react-router';
import './package-details.module.scss';
import FlightCard from './FlightCard/FlightCard';
import MatchCard from './MatchCard/MatchCard';

const { Title, Text } = Typography;

export const PackageDetails = () => {
    const { id: packageId } = useParams();
    const pkg = packageData.find((pkg) => pkg.id.toString() === packageId);

    if (!pkg) return <div>Package not found</div>;

    const totalPrice = pkg.flights_price + pkg.matches_price;

    const flightLabels = ['First Flight', 'Connecting Flight', 'Last Flight'];
    const destinationLabels = ['First Destination', 'Second Destination'];

    return (
        <div className="package-page">
            {/* Header */}
            <div className="package-header">
                <Title level={2}>{pkg.title}</Title>
                <p className="description">{pkg.description}</p>
                <div className="package-dates">
                    <Text>
                        📅 {pkg.from} → {pkg.to}
                    </Text>
                    <Text strong>from ${totalPrice}</Text>
                </div>
                <Button type="primary">Add To Saved</Button>
            </div>

            <Divider />

            {/* Flights & Matches */}
            {pkg.flights.map((flight, index) => (
                <div key={flight.id} className="section-block">
                    <FlightCard
                        label={flightLabels[index] || 'Flight'}
                        from={flight.from}
                        to={flight.to}
                        departureDate={flight.departureDate}
                        price={flight.price}
                    />
                    {/* Show match if it exists after this flight */}
                    {pkg.matches[index] && (
                        <div className="destination-block">
                            <h3 className="destination-label">{destinationLabels[index] || 'Destination'}</h3>
                            <MatchCard
                                homeTeam={pkg.matches[index].home_team}
                                awayTeam={pkg.matches[index].away_team}
                                matchDate={pkg.matches[index].matchDate}
                                departureDate='2022-12-12' // placeholder
                                stadium={pkg.matches[index].stadium}
                                league={pkg.matches[index].league}
                                price={pkg.matches[index].price}
                                imagePath={`/images/match-${pkg.matches[index].id}.jpg`}
                                label='Match'
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
