import classes from './screen.module.scss';
import { PropsWithChildren } from 'react';
import clsx from 'clsx';

export interface ScreenProps {
    className?: string;
}

export const Screen = ({ children, className }: PropsWithChildren<ScreenProps>) => {
    return <div className={clsx([classes.screen, className])}>{children}</div>;
};
