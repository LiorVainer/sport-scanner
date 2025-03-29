import React, { useState, useEffect } from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './packages-screen.module.scss';
import PackageFooter from './PackageFooter/PackageFooter';
import { Screen } from '@/components/Screen';
import PackageSkeleton from './PackageSkeleton/PackageSkeleton';
import MatchDetails from './MatchDetails/MatchDetails';

const PackagesScreen = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        setTimeout(() => {
            import('./packageData.json').then((module) => {
                setData(module.default);
                setLoading(false);
            });
        }, 2000);
    }, []);

    return (
        <Screen className={styles.page}>
            {loading ? (
               <PackageSkeleton />
            ) : (
                data.map((pkg) => (
                    <div className={styles.packageCard} key={pkg.id}>
                         <div className={styles.matches}>
                            {pkg.matches.map((match:any, index:number) => (
                                <React.Fragment key={match.id}>
                                <div className={styles.matchItem}>
                                    <MatchDetails
                                    homeTeamImage={match.homeTeam.logo}
                                    awayTeamImage={match.awayTeam.logo}
                                    match={`${match.homeTeam.name} VS ${match.awayTeam.name}`}
                                    stadium={match.stadium}
                                    league={match.league}
                                    date={match.date}
                                    flightPrice={pkg.flightsPrice}
                                    matchesPrice={`${match.price.min}$ - ${match.price.max}$`}
                                    from={pkg.flights[index]?.departureDate || pkg.toDate}
                                    to={pkg.flights[index + 1]?.departureDate || pkg.toDate}
                                    location={pkg.location.split('&')[index] || pkg.location}
                                    />
                                    {index !== pkg.matches.length - 1 && (
                                    <ArrowRightOutlined className={styles.arrowIcon} />
                                    )}
                                </div>
                                </React.Fragment>
                            ))}
                        </div>
                        <div className={styles.divider} />
                        <PackageFooter
                            packageStartDate={pkg.fromDate}
                            packageEndDate={pkg.toDate}
                            packageMinPrice={pkg.totalPrice.min}
                            packageMaxPrice={pkg.totalPrice.max}
                            packageId={pkg.id}
                            packageData={pkg}
                        />
                    </div>
                ))
            )}
        </Screen>
    );
};

export default PackagesScreen;
