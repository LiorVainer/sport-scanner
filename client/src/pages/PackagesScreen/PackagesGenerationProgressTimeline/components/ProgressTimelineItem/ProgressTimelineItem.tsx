import { Collapse } from 'antd';
import styles from './progress-timeline-item.module.scss';
import { GeneratePackagesSteps } from '@/models/packages/packages-generate-steps.model.ts';
import { FlightSearchDetails } from '../FlightSearchDetails';
import { FixturesDetails } from '../FixturesDetails';
import { PackagesGenerationProgressUpdate } from '@/models/packages/package-generation-progress-update.model.ts';
import { getProgressStepMessage } from '@/utils/packages.utils.ts';
import React from 'react';

interface TimelineItemProps {
    progressUpdate: PackagesGenerationProgressUpdate;
}

export const ProgressTimelineItem = ({ progressUpdate }: TimelineItemProps) => {
    const hasDetails =
        ('fixtures' in progressUpdate && progressUpdate.fixtures?.length > 0) ||
        (progressUpdate.step === GeneratePackagesSteps.SEARCH_FLIGHTS &&
            progressUpdate.flightOffersSearchesParams?.length > 0);

    const renderDetails = () => {
        if (!hasDetails) return null;

        return (
            <React.Fragment>
                {progressUpdate.step === GeneratePackagesSteps.SEARCH_FLIGHTS &&
                    progressUpdate.flightOffersSearchesParams?.length > 0 && (
                        <FlightSearchDetails
                            flightOffersSearchesParams={progressUpdate.flightOffersSearchesParams}
                            cityIataToCityMetadata={progressUpdate.cityIataToCityMetadata || {}}
                        />
                    )}

                {'fixtures' in progressUpdate && progressUpdate.fixtures?.length > 0 && (
                    <FixturesDetails fixtures={progressUpdate.fixtures} />
                )}
            </React.Fragment>
        );
    };

    return hasDetails ? (
        <Collapse ghost className={styles.stepCollapse}>
            <Collapse.Panel header={<strong>{getProgressStepMessage(progressUpdate)}</strong>} key="panel">
                {renderDetails()}
            </Collapse.Panel>
        </Collapse>
    ) : (
        <div className={styles.timelineMessage}>
            <strong>{getProgressStepMessage(progressUpdate)}</strong>
        </div>
    );
};
