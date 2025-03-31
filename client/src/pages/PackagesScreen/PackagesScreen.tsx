import React, { useEffect } from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import styles from './packages-screen.module.scss';
import { Screen } from '@/components/Screen';
import { Match, PackageGenerateParams } from '@/models/package.model';
import { PackageSkeleton } from './PackageSkeleton/PackageSkeleton';
import { MatchDetails } from './MatchDetails/MatchDetails';
import { PackageFooter } from './PackageFooter/PackageFooter';
import { useQuery } from '@tanstack/react-query';
import { PackageService } from '@/api/services/package.service';
import { ROUTES } from '@/constants/routes.const';
import { Link, useNavigate } from 'react-router';

export const PackagesScreen = () => {
    const navigate = useNavigate();
    const savedFormValues: PackageGenerateParams = JSON.parse(localStorage.getItem('formValues') || '{}');

    const {
        data: packages = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['packages', savedFormValues],
        queryFn: () => PackageService.getPackages(savedFormValues),
        enabled: Object.keys(savedFormValues).length > 0,
        staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
        // cacheTime: 1000 * 60 * 10, // Cache lasts for 10 minutes
    });

    useEffect(() => {
        if (Object.keys(savedFormValues).length === 0) {
            console.log('Form values not found, navigating to home');
            navigate(ROUTES.HOME_SCREEN);
        }
    }, [savedFormValues]);

    if (error) {
        return <div className={styles.error}>Error loading packages.</div>;
    }

    if (packages.length === 0) {
        return (
            <div className={styles.error}>
                Please search again :) ,press this: <Link to={ROUTES.HOME_SCREEN}>nice link</Link>
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
