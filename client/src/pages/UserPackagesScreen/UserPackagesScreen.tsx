import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { ArrowRightOutlined } from '@ant-design/icons';
import { MatchDetails } from '../PackagesScreen/MatchDetails';
import { PackageFooter } from '../PackagesScreen/PackageFooter';
import { PackageSkeleton } from '../PackagesScreen/PackageSkeleton';
import { Match, PackageDocument } from '@/models/package.model';
import styles from './user-packages-screen.module.scss';
import { PopulatedSavedPackage } from '@/models/saved-packages.model';
import { PopulatedHistory } from '@/models/history.model';

type Props = {
    queryKey: string[];
    queryFn: () => Promise<PopulatedSavedPackage[] | PopulatedHistory[]>;
    emptyComponent: React.ReactNode;
    backRoute: string;
};

export const UserPackagesScreen: React.FC<Props> = ({ queryKey, queryFn, emptyComponent, backRoute }) => {
    const {
        data: userPackages,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey,
        queryFn,
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

    if (!userPackages || userPackages.length === 0) {
        return <Screen className={styles.page}>{emptyComponent}</Screen>;
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
        userPackages.map(({ _id: date, packages }) => (
            <div className={styles.packageContainer} key={date}>
                <h3 className={styles.dateHeader}>{date}</h3>
                {packages.map((singlePackage) => (
                    <div className={styles.packageCard} key={singlePackage.id}>
                        <div className={styles.matches}>{renderMatchList(singlePackage)}</div>
                        <div className={styles.divider} />
                        <PackageFooter singlePackage={singlePackage} backRoute={backRoute} />
                    </div>
                ))}
            </div>
        ));

    return <Screen className={styles.page}>{renderPackages()}</Screen>;
};
