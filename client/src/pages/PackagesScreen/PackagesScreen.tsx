import React, { useState, useEffect } from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './packages-screen.module.scss';
import { Screen } from '@/components/Screen';
import { Match, Package } from '@/models/package.model';
import { PackageSkeleton } from './PackageSkeleton/PackageSkeleton';
import { MatchDetails } from './MatchDetails/MatchDetails';
import { PackageFooter } from './PackageFooter/PackageFooter';

export const PackagesScreen = () => {
    const [loading, setLoading] = useState(true);
    const [packages, setPackages] = useState<Package[]>([]);

    useEffect(() => {
        setTimeout(() => {
            import('./packageData.json').then((module) => {
                setPackages(module.default);
                setLoading(false);
            });
        }, 2000);
    }, []);

    return (
        <Screen className={styles.page}>
            {loading ? (
                <PackageSkeleton />
            ) : (
                packages.map((singlePackage) => (
                    <div className={styles.packageCard} key={singlePackage.id}>
                        <div className={styles.matches}>
                            {singlePackage.matches.map((match: Match, index: number) => (
                                <React.Fragment key={match.id}>
                                    <div className={styles.matchItem}>
                                        <MatchDetails match={match} singlePackage={singlePackage} matchIndex={index} />
                                    </div>
                                    {index !== singlePackage.matches.length - 1 && (
                                        <ArrowRightOutlined className={styles.arrowIcon} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className={styles.divider} />
                        <PackageFooter singlePackage={singlePackage} />
                    </div>
                ))
            )}
        </Screen>
    );
};
