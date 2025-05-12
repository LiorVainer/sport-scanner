import styles from './package-card.module.scss';
import { PackageFooter } from '@pages/PackagesScreen/PackageFooter';
import { ROUTES } from '@/constants/routes.const.ts';
import { useMemo } from 'react';
import { Destination, Package } from '@/models/packages/package.model';
import { DestinationSection } from '@components/DestinationSection';

export interface PackageCardProps {
    singlePackage: Package;
    backRoute?: string;
}

export const PackageCard = ({ singlePackage, backRoute }: PackageCardProps) => {
    const destinations = useMemo(
        () => singlePackage.timeline.filter((item): item is Destination => item.type === 'destination'),
        [singlePackage]
    );    

    return (
        <div className={styles.packageCard}>
            <div className={styles.destinations}>
                {destinations.map((destination) => (
                    <DestinationSection destination={destination} />
                ))}
            </div>
            <div className={styles.divider} />
            <PackageFooter singlePackage={singlePackage} backRoute={backRoute ?? ROUTES.PACKAGES} />
        </div>
    );
};
