import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './flight-search-details.module.scss';
import moment from 'moment';
import { FlightSearchParams } from '@/models/flights/flights-search-params.model';
import { CityIataToCityMetadataCodeMap } from '@/models/flights/iata.model';

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

    return (
        <div className={styles.infoBlock}>
            <div className={styles.fixtureList}>
                {flightOffersSearchesParams.map((params, index) => {
                    const { origin, destination, dateTo, isRoundTrip } = params;
                    const originCity = cityIataToCityMetadata[origin];
                    const destinationCity = cityIataToCityMetadata[destination];

                    return (
                        <div className={styles.flightsSearchItem} key={index}>
                            <div className={styles.flightsCities}>
                                <div className={styles.flightCityDetails}>
                                    <span className={styles.flightCity}>{originCity?.bigCityInIata}</span>
                                    <p className={styles.flightIATA}>({origin})</p>
                                </div>
                                <span className={styles.flightTo}>
                                    <ArrowRightOutlined />
                                </span>
                                <div className={styles.flightCityDetails}>
                                    <span className={styles.flightCity}>{destinationCity?.bigCityInIata}</span>
                                    <p className={styles.flightIATA}>({destination})</p>
                                </div>
                            </div>
                            <span className={styles.isRoundTrip}>{isRoundTrip ? 'Round Trip' : 'One Way'}</span>
                            <div className={styles.metadata}>
                                <p className={styles.flightDate}>{moment(new Date(dateTo)).format('DD/MM')}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
