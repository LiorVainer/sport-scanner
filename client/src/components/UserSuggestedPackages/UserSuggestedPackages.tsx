import classes from './user-suggested-packages.module.scss';
import { Package } from '@/models/packages/package.model.ts';
import { PackageCard } from '@components/PackageCard';

export interface UserSuggestedPackagesProps {
    userSuggestedPackages: Package[];
}

export const UserSuggestedPackages = ({ userSuggestedPackages }: UserSuggestedPackagesProps) => {
    return (
        <div className={classes.container}>
            <h2>Suggested Packages For You</h2>
            <div className={classes.suggestedPackagesContainer}>
                {userSuggestedPackages?.map((singlePackage) => (
                    <PackageCard singlePackage={singlePackage} variant="compact" />
                ))}
            </div>
        </div>
    );
};
