import { Collapse } from 'antd';
import styles from './progress-timeline-item.module.scss';
import { GeneratePackagesSteps } from '@/models/packages/packages-generate-steps.model.ts';
import { FlightSearchDetails } from '../FlightSearchDetails';
import { FixturesDetails } from '../FixturesDetails';
import { PackagesGenerationProgressUpdate } from '@/models/packages/package-generation-progress-update.model.ts';
import { getProgressStepMessage } from '@/utils/packages.utils.ts';

interface TimelineItemProps {
    step: PackagesGenerationProgressUpdate;
}

export const ProgressTimelineItem = ({ step }: TimelineItemProps) => {
    const hasDetails =
        ('fixtures' in step && step.fixtures?.length > 0) ||
        (step.step === GeneratePackagesSteps.SEARCH_FLIGHTS && step.flightOffersSearchesParams?.length > 0);

    const renderDetails = () => {
        if (!hasDetails) return null;

        return (
            <>
                {step.step === GeneratePackagesSteps.SEARCH_FLIGHTS && step.flightOffersSearchesParams?.length > 0 && (
                    <FlightSearchDetails
                        flightOffersSearchesParams={step.flightOffersSearchesParams}
                        cityIataToCityMetadata={step.cityIataToCityMetadata || {}}
                    />
                )}

                {'fixtures' in step && step.fixtures?.length > 0 && <FixturesDetails fixtures={step.fixtures} />}
            </>
        );
    };

    return hasDetails ? (
        <Collapse ghost className={styles.stepCollapse}>
            <Collapse.Panel header={<strong>{getProgressStepMessage(step)}</strong>} key="panel">
                {renderDetails()}
            </Collapse.Panel>
        </Collapse>
    ) : (
        <div className={styles.timelineMessage}>
            <strong>{getProgressStepMessage(step)}</strong>
        </div>
    );
};
