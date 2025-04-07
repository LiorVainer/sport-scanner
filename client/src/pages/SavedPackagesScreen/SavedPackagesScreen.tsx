import React from 'react';
import styles from './saved-packages-screen.module.scss';
import { Screen } from '@/components/Screen';
import { SavedPackageService } from '@/api/services/saved-package.service';
import { useQuery } from '@tanstack/react-query';
import { Match, PackageDocument } from '@/models/package.model';
import { MatchDetails } from '../PackagesScreen/MatchDetails';
import { ArrowRightOutlined } from '@ant-design/icons';
import { PackageFooter } from '../PackagesScreen/PackageFooter';
import { ROUTES } from '@/constants/routes.const';
import { PackageSkeleton } from '../PackagesScreen/PackageSkeleton';
import { NoSavedPackages } from './NoSavedPackages';

export const SavedPackagesScreen = () => {
    const {
        data: usersSavedPackages,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['usersSavedPackages'],
        queryFn: () => SavedPackageService.getUsersSavedPackages(),
    });

    if (isError) {
        return <Screen className={styles.page}>Error: {(error as Error).message}</Screen>;
    }

    if (isLoading) {
        return (
            <Screen className={styles.page}>
                <PackageSkeleton />
            </Screen>
        );
    }

    if (!usersSavedPackages || usersSavedPackages.length === 0) {
        return (
            <Screen className={styles.page}>
                <NoSavedPackages />
            </Screen>
        );
    }

    const renderMatchList = (singlePackage: PackageDocument) =>
        singlePackage.matches.map((match: Match, index: number) => {
            const previousMatch = index > 0 ? singlePackage.matches[index - 1] : null;

            const showHeader = match.homeTeam.id !== previousMatch?.homeTeam.id;

            const isNotLast = index !== singlePackage.matches.length - 1;

            return (
                <React.Fragment key={match.id}>
                    <div className={styles.matchItem}>
                        <MatchDetails
                            {...(previousMatch && { showHeader })}
                            match={match}
                            singlePackage={singlePackage}
                            matchIndex={index}
                        />
                    </div>
                    {isNotLast && <ArrowRightOutlined className={styles.arrowIcon} />}
                </React.Fragment>
            );
        });

    const renderPackages = () =>
        usersSavedPackages.map(({ _id: date, packages }) => (
            <div className={styles.packageContainer} key={date}>
                <h3 className={styles.dateHeader}>{date}</h3>
                {packages.map((singlePackage) => (
                    <div className={styles.packageCard} key={singlePackage.id}>
                        <div className={styles.matches}>{renderMatchList(singlePackage)}</div>
                        <div className={styles.divider} />
                        <PackageFooter
                            singlePackage={singlePackage}
                            backRoute={`/${ROUTES.SAVED_PACKAGES.replace(/^\/+/, '')}`}
                            isInHistoryOrSavedPage
                        />
                    </div>
                ))}
            </div>
        ));

    return <Screen className={styles.page}>{renderPackages()}</Screen>;
};
