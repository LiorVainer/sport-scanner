import { Button, Collapse, Spin, Timeline } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import styles from './packages-generation-progress-timeline.module.scss';
import { usePackages } from '@/context/PackagesContext.tsx';
import { getProgressStepMessage } from '@/utils/packages.utils.ts';
import { FixturesToFlattenedDetails } from '@/utils/fixture.utils.ts';
import { GeneratePackagesSteps } from '@/models/packages/packages-generate-steps.model.ts';
import moment from 'moment';

export const PackagesGenerationProgressTimeline = () => {
    const { progressSteps, hideProgressSteps, setHideProgressSteps, isLoading, packages } = usePackages();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleContainer}>
                    <h4 className={styles.title}>
                        {isLoading ? 'Generating Packages' : `Generated ${packages?.length} Packages`}
                    </h4>
                    {isLoading && <Spin />}
                </div>
                <Button
                    type="primary"
                    className={styles.hideButton}
                    onClick={() => setHideProgressSteps(!hideProgressSteps)}
                >
                    {hideProgressSteps ? 'Show' : 'Hide'} Progress
                </Button>
            </div>

            {!hideProgressSteps && (
                <Timeline className={styles.timeline}>
                    {progressSteps.map((step, idx) => {
                        const isCurrent = idx === progressSteps.length - 1;
                        const isDone = !isCurrent || step.step === GeneratePackagesSteps.FINISHED_GENERATING_PACKAGES;
                        const message = getProgressStepMessage(step);

                        const hasDetails =
                            ('fixtures' in step && step.fixtures.length > 0) ||
                            (step.step === GeneratePackagesSteps.SEARCH_FLIGHTS &&
                                step.flightOffersSearchesParams?.length > 0);

                        const renderDetails = () => (
                            <>
                                {step.step === GeneratePackagesSteps.SEARCH_FLIGHTS &&
                                    step.flightOffersSearchesParams?.length > 0 && (
                                        <div className={styles.infoBlock}>
                                            <div className={styles.fixtureList}>
                                                {step.flightOffersSearchesParams.map((params, i) => {
                                                    const { origin, destination, dateTo, isRoundTrip } = params;
                                                    const originCity = step.cityIataToCityMetadata[origin];
                                                    const destinationCity = step.cityIataToCityMetadata[destination];
                                                    console.log(step.cityIataToCityMetadata);

                                                    return (
                                                        <div className={styles.flightsSearchItem} key={i}>
                                                            <div className={styles.flightsCities}>
                                                                <div className={styles.flightCityDetails}>
                                                                    <span className={styles.flightCity}>
                                                                        {originCity?.bigCityInIata}
                                                                    </span>
                                                                    <p className={styles.flightIATA}>({origin})</p>
                                                                </div>
                                                                <span className={styles.flightTo}>
                                                                    <ArrowRightOutlined />
                                                                </span>
                                                                <div className={styles.flightCityDetails}>
                                                                    <span className={styles.flightCity}>
                                                                        {destinationCity?.bigCityInIata}
                                                                    </span>
                                                                    <p className={styles.flightIATA}>({destination})</p>
                                                                </div>
                                                            </div>
                                                            <span className={styles.isRoundTrip}>
                                                                {isRoundTrip ? 'Round Trip' : 'One Way'}
                                                            </span>
                                                            <div className={styles.metadata}>
                                                                <p className={styles.flightDate}>
                                                                    {moment(new Date(dateTo)).format('DD/MM')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                {'fixtures' in step && step.fixtures.length > 0 && (
                                    <div className={styles.infoBlock}>
                                        <div className={styles.fixtureList}>
                                            {FixturesToFlattenedDetails(step.fixtures).map(
                                                ({ homeTeam, awayTeam, date, price }) => (
                                                    <div className={styles.fixtureItem} key={date}>
                                                        <div className={styles.fixtureTeams}>
                                                            <div className={styles.teamDetails}>
                                                                <p className={styles.teamName}>{homeTeam.name}</p>
                                                                <img
                                                                    src={homeTeam.logo}
                                                                    alt={homeTeam.name}
                                                                    className={styles.teamLogo}
                                                                />
                                                            </div>
                                                            <span className={styles.vs}>VS</span>
                                                            <div className={styles.teamDetails}>
                                                                <img
                                                                    src={awayTeam.logo}
                                                                    alt={awayTeam.name}
                                                                    className={styles.teamLogo}
                                                                />
                                                                <p className={styles.teamName}>{awayTeam.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className={styles.metadata}>
                                                            {price ? (
                                                                <p className={styles.fixturePrice}>
                                                                    <span>{`${price?.min}$`}</span>
                                                                    <ArrowRightOutlined />
                                                                    <span>{`${price?.max}$`}</span>
                                                                </p>
                                                            ) : (
                                                                <p className={styles.fixtureDate}>
                                                                    {moment(new Date(date)).format('DD/MM')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        );

                        return (
                            <Timeline.Item
                                key={idx}
                                dot={
                                    isDone ? (
                                        <CheckCircleOutlined style={{ color: 'green' }} />
                                    ) : (
                                        <ClockCircleOutlined />
                                    )
                                }
                                color={isDone ? 'green' : 'blue'}
                                className={styles.timelineItem}
                            >
                                {hasDetails ? (
                                    <Collapse ghost className={styles.stepCollapse}>
                                        <Collapse.Panel header={<strong>{message}</strong>} key="panel">
                                            {renderDetails()}
                                        </Collapse.Panel>
                                    </Collapse>
                                ) : (
                                    <div className={styles.timelineMessage}>
                                        <strong>{message}</strong>
                                    </div>
                                )}
                            </Timeline.Item>
                        );
                    })}
                </Timeline>
            )}
        </div>
    );
};
