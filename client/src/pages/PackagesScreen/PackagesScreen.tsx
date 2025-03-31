import React from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './packages-screen.module.scss';
import { Screen } from '@/components/Screen';
import { Match } from '@/models/package.model';
import { PackageSkeleton } from './PackageSkeleton/PackageSkeleton';
import { MatchDetails } from './MatchDetails/MatchDetails';
import { PackageFooter } from './PackageFooter/PackageFooter';
import { ROUTES } from '@/constants/routes.const';
import { useNavigate } from 'react-router';
import { usePackages } from '@/context/PackagesContext';
import { Button } from 'antd';

export const PackagesScreen = () => {
    const { isLoading, packages } = usePackages();
    const navigate = useNavigate();

    if (!isLoading && !packages.length) {
        return (
            <div className={styles.noResults}>
                <h2>No Packages Found 😞</h2>
                <p>Try adjusting your search params and try again!</p>
                <Button onClick={() => navigate(ROUTES.HOME_SCREEN)} className={styles.retryLink}>
                    🔍 Search Again
                </Button>
            </div>
        );
    }

    return (
        <Screen className={styles.page}>
            {isLoading ? (
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
