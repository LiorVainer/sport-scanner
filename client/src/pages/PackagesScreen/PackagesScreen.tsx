import React, { useState, useEffect } from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './packages-screen.module.scss';
import { Screen } from '@/components/Screen';
import { Match, Package, PackageGenerateParams } from '@/models/package.model';
import { PackageSkeleton } from './PackageSkeleton/PackageSkeleton';
import { MatchDetails } from './MatchDetails/MatchDetails';
import { PackageFooter } from './PackageFooter/PackageFooter';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useSearchParams } from 'react-router';
import { PackageService } from '@/api/services/package.service';

export const PackagesScreen = () => {
    const location = useLocation();
    const formValues = location.state as PackageGenerateParams;

    const { country, ...rest } = formValues;
    // Fetch packages using React Query
    const {
        data: packages = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['packages', formValues],
        queryFn: () => PackageService.getPackages(rest),
        enabled: !!formValues?.date, // Ensure valid data before fetching
    });

    if (error) {
        return <div className={styles.error}>Error loading packages.</div>;
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
