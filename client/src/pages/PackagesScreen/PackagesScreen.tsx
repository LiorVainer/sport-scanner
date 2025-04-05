import React from 'react';
import styles from './packages-screen.module.scss';
import {Screen} from '@/components/Screen';
import {Match, Package} from '@/models/package.model';
import {PackageSkeleton} from './PackageSkeleton/PackageSkeleton';
import {MatchDetails} from './MatchDetails/MatchDetails';
import {PackageFooter} from './PackageFooter/PackageFooter';
import {ROUTES} from '@/constants/routes.const';
import {useNavigate} from 'react-router';
import {usePackages} from '@/context/PackagesContext';
import {Button} from 'antd';
import {ArrowRightOutlined} from '@ant-design/icons';

export const PackagesScreen = () => {
    const {isLoading, packages} = usePackages();
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

    const renderMatchList = (singlePackage: Package) =>
        singlePackage.matches.map((match: Match, index: number) => {
            const previousMatch = index > 0 ? singlePackage.matches[index - 1] : null;
            
            const showHeader =
                match.homeTeam.id !== previousMatch?.homeTeam.id

            const isNotLast = index !== singlePackage.matches.length - 1;

            return (
                <React.Fragment key={match.id}>
                    <div className={styles.matchItem}>
                        <MatchDetails
                            {...(previousMatch && {showHeader})}
                            match={match}
                            singlePackage={singlePackage}
                            matchIndex={index}
                        />
                    </div>
                    {isNotLast && <ArrowRightOutlined className={styles.arrowIcon}/>}
                </React.Fragment>
            );
        });


    const renderPackages = () =>
        packages?.map((singlePackage) => (
            <div className={styles.packageCard} key={singlePackage.id}>
                <div className={styles.matches}>{renderMatchList(singlePackage)}</div>
                <div className={styles.divider}/>
                <PackageFooter singlePackage={singlePackage}/>
            </div>
        ));

    return (
        <Screen className={styles.page}>
            {isLoading ? <PackageSkeleton/> : renderPackages()}
        </Screen>
    );
};
