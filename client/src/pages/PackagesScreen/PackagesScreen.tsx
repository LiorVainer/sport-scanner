import React from 'react';
import styles from './packages-screen.module.scss';
import { Screen } from '@/components/Screen';
import { PackageSkeleton } from './PackageSkeleton/PackageSkeleton';
import { ROUTES } from '@/constants/routes.const';
import { useNavigate } from 'react-router';
import { usePackages } from '@/context/PackagesContext';
import { Button } from 'antd';
import { PackagesGenerationProgressTimeline } from '@pages/PackagesScreen/PackagesGenerationProgressTimeline';
import { PackageCard } from '@components/PackageCard';

export const PackagesScreen = () => {
    const { isLoading, packages, hideProgressSteps } = usePackages();
    const navigate = useNavigate();

    const handleRetry = () => navigate(ROUTES.HOME);

    const isEmptyResults = !isLoading && packages && packages.length === 0;

    if (isEmptyResults) {
        return (
            <div className={styles.noResults}>
                <h2>No Packages Found 😞</h2>
                <p>Try adjusting your search params and try again!</p>
                <Button onClick={handleRetry} className={styles.retryLink}>
                    🔍 Search Again
                </Button>
            </div>
        );
    }

    return (
        <Screen className={styles.page}>
            <PackagesGenerationProgressTimeline />
            {isLoading ? (
                <PackageSkeleton />
            ) : (
                packages?.map((singlePackage) => <PackageCard singlePackage={singlePackage} />)
            )}
        </Screen>
    );
};
