import React from 'react';
import styles from './history-screen.module.scss';
import { Screen } from '@/components/Screen';
import { useQuery } from '@tanstack/react-query';
import { ArrowRightOutlined } from '@ant-design/icons';
import { MatchDetails } from '../PackagesScreen/MatchDetails';
import { PackageFooter } from '../PackagesScreen/PackageFooter';
import { PackageSkeleton } from '../PackagesScreen/PackageSkeleton';
import { Match, PackageDocument } from '@/models/package.model';
import { ROUTES } from '@/constants/routes.const';
import { NoHistory } from './NoHistory';
import { UsersService } from '@/api/services/users.service';

export const HistoryScreen = () => {
    const {
        data: userHistory,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['usersHistory'],
        queryFn: UsersService.getUsersHistory,
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

    if (!userHistory || userHistory.length === 0) {
        return (
            <Screen className={styles.page}>
                <NoHistory />
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
        userHistory.map(({ _id: date, packages }) => (
            <div className={styles.packageContainer} key={date}>
                <h3 className={styles.dateHeader}>{date}</h3>
                {packages.map((singlePackage) => (
                    <div className={styles.packageCard} key={singlePackage.id}>
                        <div className={styles.matches}>{renderMatchList(singlePackage)}</div>
                        <div className={styles.divider} />
                        <PackageFooter
                            singlePackage={singlePackage}
                            backRoute={`/${ROUTES.HISTORY.replace(/^\/+/, '')}`}
                            isInHistoryOrSavedPage
                        />
                    </div>
                ))}
            </div>
        ));

    return <Screen className={styles.page}>{renderPackages()}</Screen>;
};
