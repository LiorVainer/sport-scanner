import React from 'react';
import styles from './history-screen.module.scss';
import { Screen } from '@/components/Screen';
import { useQuery } from '@tanstack/react-query';
import { HistoryService } from '@/api/services/history.service';
import { ArrowRightOutlined } from '@ant-design/icons';
import { MatchDetails } from '../PackagesScreen/MatchDetails';
import { PackageFooter } from '../PackagesScreen/PackageFooter';
import { PackageSkeleton } from '../PackagesScreen/PackageSkeleton';
import { Match, PackageDocument } from '@/models/package.model';
import { ROUTES } from '@/constants/routes.const';

export const HistoryScreen = () => {
    const {
        data: userHistory,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['usersHistory'],
        queryFn: HistoryService.getUsersHistory,
    });

    if (isError) {
        return <Screen className={styles.page}>Error: {(error as Error).message}</Screen>;
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
        userHistory?.map((singlePackage) => (
            <div className={styles.packageCard} key={singlePackage.id}>
                <div className={styles.matches}>{renderMatchList(singlePackage)}</div>
                <div className={styles.divider} />
                <PackageFooter
                    singlePackage={singlePackage}
                    backRoute={`/${ROUTES.HISTORY.replace(/^\/+/, '')}`}
                />
            </div>
        ));

    return <Screen className={styles.page}>{isLoading ? <PackageSkeleton /> : renderPackages()}</Screen>;
};
