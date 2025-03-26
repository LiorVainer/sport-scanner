import classes from './loading-container.module.scss';
import { Spin } from 'antd';
import { Screen } from '@components/Screen';

export interface LoadingContainerProps {
    loadingText?: string;
}

export const LoadingContainer = ({ loadingText }: LoadingContainerProps) => (
    <Screen className={classes.loadingContainer}>
        <Spin className={classes.spinner} size="large" />
        {loadingText && <h4 className={classes.loadingText}>{loadingText}</h4>}
    </Screen>
);
