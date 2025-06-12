import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { PackageSkeleton } from '../PackagesScreen/PackageSkeleton';
import styles from './user-packages-screen.module.scss';
import { PopulatedSavedPackage } from '@/models/saved-packages.model';
import { PopulatedHistory } from '@/models/history.model';
import { PackageCard } from '@/components/PackageCard';

type Props = {
    title?: string;
    queryKey: string[];
    queryFn: () => Promise<PopulatedSavedPackage[] | PopulatedHistory[]>;
    emptyComponent: React.ReactNode;
    backRoute: string;
};

export const UserPackagesScreen: React.FC<Props> = ({ title, queryKey, queryFn, emptyComponent, backRoute }) => {
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
                {Array.from({ length: 4 }).map((_, index) => (
                    <PackageSkeleton key={index} />
                ))}
            </Screen>
        );
    }

    if (!userPackages || userPackages.length === 0) {
        return <Screen className={styles.page}>{emptyComponent}</Screen>;
    }

    return (
        <Screen className={styles.page}>
            {title && (
                <div className={styles.header}>
                    <h1>{title}</h1>
                </div>
            )}
            {userPackages.map(({ _id: date, packages }) => (
                <div className={styles.packageContainer} key={date}>
                    <h3 className={styles.dateHeader}>{date}</h3>
                    {packages.map((singlePackage) => (
                        <PackageCard singlePackage={singlePackage} backRoute={backRoute} />
                    ))}
                </div>
            ))}
        </Screen>
    );
};
