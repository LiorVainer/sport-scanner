import { Navbar } from '@components/Navbar';
import { Outlet } from 'react-router';
import { PropsWithChildren } from 'react';
import classes from './layout.module.scss';

export interface LayoutProps {}

export const Layout = (_props: PropsWithChildren<LayoutProps>) => (
    <div className={classes.layout}>
        <Navbar />
        <Outlet />
    </div>
);
