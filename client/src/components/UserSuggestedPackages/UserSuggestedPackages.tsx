import classes from './user-suggested-packages.module.scss';
import { PackageCard } from '@components/PackageCard';
import { ROUTES } from '@/constants/routes.const.ts';
import { useQuery } from '@tanstack/react-query';
import { UsersService } from '../../api/services/users.service';
import { PackageSkeleton } from '../../pages/PackagesScreen/PackageSkeleton';

export interface UserSuggestedPackagesProps {}

export const UserSuggestedPackages = ({}: UserSuggestedPackagesProps) => {
    const { data: userSuggestedPackages = [], isPending } = useQuery({
        queryKey: ['users', 'suggestedPackages'],
        queryFn: () => UsersService.getUsersSuggestedPackages(),
    });

    if (isPending) {
        return (
            <div className={classes.container}>
                <h2>Suggested Packages For You</h2>
                <div className={classes.suggestedPackagesContainer}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <PackageSkeleton key={index} variant={'compact'} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={classes.container}>
            {userSuggestedPackages.length > 0 ? (
                <>
                    <h2>Suggested Packages For You</h2>
                    <div className={classes.suggestedPackagesContainer}>
                        {userSuggestedPackages?.map((singlePackage) => (
                            <PackageCard
                                singlePackage={singlePackage}
                                variant="compact"
                                backRoute={ROUTES.HOME}
                                isFullHeight
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div className={classes.container}>
                    <h2>No Suggested Packages Available</h2>
                    <div className={classes.noPackagesText}>
                        <span>We couldn't find packages that are suitable for your preferences. 😔</span>
                        <span>Try adjusting your preferences or check back later!</span>
                    </div>

                    {/*<div className={classes.suggestedPackagesContainer}>*/}
                    {/*    {Array.from({ length: 3 }).map((_, index) => (*/}
                    {/*        <PackageSkeleton key={index} variant={'compact'} isActive={false} />*/}
                    {/*    ))}*/}
                    {/*</div>*/}
                </div>
            )}
        </div>
    );
};
