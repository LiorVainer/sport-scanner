import classes from './screen.module.scss';
import { PropsWithChildren } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export interface ScreenProps {
    className?: string;
}

export const Screen = ({ children, className }: PropsWithChildren<ScreenProps>) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={clsx(classes.screen, className)}
        >
            {children}
        </motion.div>
    );
};
