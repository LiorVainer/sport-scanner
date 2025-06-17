import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneArrival, faPlaneDeparture } from '@fortawesome/free-solid-svg-icons';
import styles from './flight-search-details.module.scss';
import { FlightSearchParams } from '@/models/flights/flights-search-params.model';
import { CityIataToCityMetadataCodeMap } from '@/models/flights/iata.model';
import { aggregateFlightSearches } from './flight-search.utils';
import { useMemo } from 'react';

interface FlightSearchDetailsProps {
    flightOffersSearchesParams: FlightSearchParams[];
    cityIataToCityMetadata: CityIataToCityMetadataCodeMap;
}

export const FlightSearchDetails = ({
    flightOffersSearchesParams,
    cityIataToCityMetadata,
}: FlightSearchDetailsProps) => {
    if (!flightOffersSearchesParams || flightOffersSearchesParams.length === 0) {
        return null;
    }

    const aggregated = useMemo(() => aggregateFlightSearches(flightOffersSearchesParams), [flightOffersSearchesParams]);

    return (
        <div className={styles.infoBlock}>
            <div className={styles.infoBlock}>
                <div className={styles.fixtureList}>
                    {aggregated.map(({ origin, destination, dateRange }, index) => {
                        const originCity = cityIataToCityMetadata[origin];
                        const destinationCity = cityIataToCityMetadata[destination];
                        const isBackToOrigin = index % 2 === 1;

                        return (
                            <div className={styles.flightsSearchItem} key={index}>
                                <div className={styles.flightTypeIcon}>
                                    <FontAwesomeIcon
                                        icon={isBackToOrigin ? faPlaneArrival : faPlaneDeparture}
                                        style={{ marginRight: '0.5rem' }}
                                    />
                                    <div className={styles.flightsCities}>
                                        <div className={styles.flightCityDetails}>
                                            <span className={styles.flightCity}>{originCity?.bigCityInIata}</span>
                                            <p className={styles.flightIATA}>({origin})</p>
                                        </div>
                                        <span className={styles.flightTo}>-</span>
                                        <div className={styles.flightCityDetails}>
                                            <span className={styles.flightCity}>{destinationCity?.bigCityInIata}</span>
                                            <p className={styles.flightIATA}>({destination})</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.metadata}>
                                    <p className={styles.flightDate}>
                                        {dateRange.from === dateRange.to
                                            ? dateRange.from
                                            : `${dateRange.from} – ${dateRange.to}`}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
