import { Navbar } from '@components/Navbar';
// layout/OutletWrapper.tsx
import { Outlet, useLocation } from 'react-router';
import { PropsWithChildren } from 'react';
import classes from './layout.module.scss';
import { motion } from 'framer-motion';

export interface LayoutProps {}

export const Layout = (_props: PropsWithChildren<LayoutProps>) => {
    const location = useLocation();

    return (
        <div className={classes.layout}>
            <Navbar />
            <OutletWrapper key={location.pathname} />
        </div>
    );
};

const OutletWrapper = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={classes.outletWrapper}
        >
            <Outlet />
        </motion.div>
    );
};

export default OutletWrapper;
