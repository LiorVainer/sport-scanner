import classes from './user-suggested-packages.module.scss';
import { PackageCard } from '@components/PackageCard';
import { ROUTES } from '@/constants/routes.const.ts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UsersService } from '../../api/services/users.service';
import { PackageSkeleton } from '../../pages/PackagesScreen/PackageSkeleton';
import { Shuffle } from 'lucide-react';
import { useState } from 'react';

export interface UserSuggestedPackagesProps {}

export const UserSuggestedPackages = ({}: UserSuggestedPackagesProps) => {
    const [isRegenerating, setIsRegenerating] = useState(false);
    const queryClient = useQueryClient();

    const { data: userSuggestedPackages = [], isPending } = useQuery({
        queryKey: ['users', 'suggestedPackages'],
        queryFn: () => UsersService.getUsersSuggestedPackages(),
    });

    const regenerateMutation = useMutation({
        mutationFn: () => UsersService.regenerateUserSuggestedPackages(),
        onMutate: () => {
            setIsRegenerating(true);
        },
        onSuccess: (data) => {
            // Invalidate and refetch suggested packages
            queryClient.invalidateQueries({ queryKey: ['users', 'suggestedPackages'] });
            console.log('Successfully regenerated packages:', data);
        },
        onError: (error) => {
            console.error('Failed to regenerate packages:', error);
        },
        onSettled: () => {
            setIsRegenerating(false);
        },
    });

    const handleReshuffle = () => {
        regenerateMutation.mutate();
    };

    if (isPending || isRegenerating) {
        return (
            <div className={classes.container}>
                <div className={classes.header}>
                    <h2>Suggested Packages For You</h2>
                    <button
                        className={classes.reshuffleButton}
                        disabled={true}
                        aria-label="Regenerate suggested packages"
                    >
                        <Shuffle size={12} />
                        {isRegenerating ? 'Generating...' : 'Reshuffle'}
                    </button>
                </div>
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
                    <div className={classes.header}>
                        <h2>Suggested Packages For You</h2>
                        <button
                            className={classes.reshuffleButton}
                            onClick={handleReshuffle}
                            disabled={regenerateMutation.isPending}
                            aria-label="Regenerate suggested packages"
                        >
                            <Shuffle size={12} />
                            Reshuffle
                        </button>
                    </div>
                    <div className={classes.suggestedPackagesContainer}>
                        {userSuggestedPackages?.map((singlePackage) => (
                            <PackageCard
                                key={singlePackage._id}
                                singlePackage={singlePackage}
                                variant="compact"
                                backRoute={ROUTES.HOME}
                                isFullHeight
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div className={classes.emptyContainer}>
                    <div className={classes.emptyHeader}></div>
                    <div className={classes.emptyContent}>
                        <h2>No Suggested Packages Available</h2>
                        <div className={classes.noPackagesText}>
                            <span>We couldn't find packages that are suitable for your preferences. 😔</span>
                            <span>Try adjusting your preferences or click "Generate New" to try again!</span>
                        </div>
                        <button
                            className={classes.reshuffleButton}
                            onClick={handleReshuffle}
                            disabled={regenerateMutation.isPending}
                            aria-label="Generate new suggested packages"
                        >
                            <Shuffle size={20} />
                            {regenerateMutation.isPending ? 'Generating...' : 'Generate New'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
