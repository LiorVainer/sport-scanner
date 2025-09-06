import styles from './package-card.module.scss';

import { PackageFooter } from '@pages/PackagesScreen/PackageFooter';
import { useMemo } from 'react';
import { Destination, Package } from '@/models/packages/package.model';
import { DestinationSection } from '@components/DestinationSection';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext.tsx';

export interface PackageCardProps {
    singlePackage: Package;
    backRoute?: string;
    variant?: 'full' | 'compact';
    isFullHeight?: boolean;
}

export const PackageCard = ({ singlePackage, backRoute, variant = 'full', isFullHeight = false }: PackageCardProps) => {
    const destinations = useMemo(
        () => singlePackage.timeline.filter((item): item is Destination => item.type === 'destination'),
        [singlePackage]
    );

    const { loggedInUser } = useAuth();

    return (
        <div
            className={clsx(styles.packageCardContainer, {
                [styles.fullHeight]: isFullHeight,
            })}
        >
            <div className={styles.packageHeader}>
                <h4 className={styles.packageTitle}>⚽ {singlePackage.title}</h4>
                {loggedInUser?.showPackageInvalidity && singlePackage.invalidity && (
                    <span className={styles.invalidity}>⚠️</span>
                )}
            </div>
            <div className={styles.packageCard}>
                <div className={styles.content}>
                    <div className={styles.destinations}>
                        {destinations.map((destination) => (
                            <DestinationSection destination={destination} variant={variant} />
                        ))}
                    </div>
                </div>
                <PackageFooter singlePackage={singlePackage} backRoute={backRoute} />
            </div>
        </div>
    );
};
