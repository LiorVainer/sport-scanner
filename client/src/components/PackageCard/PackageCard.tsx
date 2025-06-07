import styles from './package-card.module.scss';
import { PackageFooter } from '@pages/PackagesScreen/PackageFooter';
import { useMemo } from 'react';
import { Destination, Package } from '@/models/packages/package.model';
import { DestinationSection } from '@components/DestinationSection';

export interface PackageCardProps {
    singlePackage: Package;
    backRoute?: string;
    variant?: 'full' | 'compact';
}

export const PackageCard = ({ singlePackage, backRoute, variant = 'full' }: PackageCardProps) => {
    const destinations = useMemo(
        () => singlePackage.timeline.filter((item): item is Destination => item.type === 'destination'),
        [singlePackage]
    );

    return (
        <div className={styles.packageCard}>
            <div className={styles.destinations}>
                {destinations.map((destination) => (
                    <DestinationSection destination={destination} variant={variant} />
                ))}
            </div>
            <PackageFooter singlePackage={singlePackage} backRoute={backRoute} />
        </div>
    );
};
