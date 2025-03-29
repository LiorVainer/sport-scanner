// PackageDetailsScreen.tsx
import { Typography, Button } from 'antd';
import {
  PushpinOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router';
import styles from './package-details-screen.module.scss';
import FlightCard from './FlightCard/FlightCard';
import MatchCard from './MatchCard/MatchCard';
import { formattedDate } from '@/utils/date.utils';
import { romanize } from 'romans';
import { ROUTES } from '@/constants/routes.const';

const { Title, Text } = Typography;

export const PackageDetailsScreen = () => {
  const location = useLocation();
  const pkg = location.state;

  if (!pkg) return <div>Package not found</div>;

  const timelineItems = [
    ...pkg.flights.map((flight: any, index: number) => ({
      type: 'flight',
      date: new Date(flight.departureDate),
      data: flight,
      index
    })),
    ...pkg.matches.map((match: any, index: number) => ({
      type: 'match',
      date: new Date(match.date),
      data: match,
      index
    }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className={styles['package-page']}>
      <div className={styles['package-header']}>
        <Link to={ROUTES.PACKAGES}>
          <ArrowLeftOutlined className={styles['back-icon']} />
        </Link>

        <div className={styles['package-info']}>
          <Title className={styles['package-title']}>{pkg.title}</Title>
          <Text className={styles['package-description']}>{pkg.description}</Text>
        </div>

        <div className={styles['package-details']}>
          <div className={styles['package-details-container']}>
            <Text className={styles['package-date']}>
              <img src="/public/calendar.png" alt="calendar" className={styles['calendar-icon']} />
              {formattedDate(pkg.fromDate)} <ArrowRightOutlined className={styles['arrow-icon']} />{' '}
              {formattedDate(pkg.toDate)}
            </Text>
            <Text className={styles['package-price']}>
              <em>from <strong>{pkg.totalPrice.min}$</strong></em>
            </Text>
          </div>
          <Button type="primary" className={styles['save-button']}>
            <PushpinOutlined /> Add To Saved
          </Button>
        </div>
      </div>

      {timelineItems.map((item, timelineIndex) => {
        if (item.type === 'flight') {
          const flight = item.data;
          return (
            <div key={`flight-${timelineIndex}`} className={styles['section-block']}>
              <FlightCard
                label={`Flight ${romanize(item.index + 1)}`}
                originName={flight.origin.name}
                originCode={flight.origin.iataCode}
                destinationName={flight.destination.name}
                destinationCode={flight.destination.iataCode}
                departureDate={flight.departureDate}
                price={flight.price}
                linkForTicket={flight.searchFlightTicketsLink}
              />
            </div>
          );
        }

        if (item.type === 'match') {
          const match = item.data;
          return (
            <div key={`match-${timelineIndex}`} className={styles['section-block']}>
              <MatchCard
                homeTeam={match.homeTeam.name}
                awayTeam={match.awayTeam.name}
                matchDate={match.date}
                from={pkg.fromDate}
                to={pkg.toDate}
                stadium={match.stadium}
                league={match.league}
                price={match.price.min}
                homeTeamImage={match.homeTeam.logo}
                awayTeamImage={match.awayTeam.logo}
                label={`Match ${romanize(item.index + 1)}`}
                location={pkg.location.split('&')[item.index]}
                linkForTicket={match.searchMatchTicketsLink}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default PackageDetailsScreen;
