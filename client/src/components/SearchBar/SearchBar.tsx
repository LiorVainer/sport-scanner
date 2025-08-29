import { useState } from 'react';
import FilterSearch from '../FilterSearch/FilterSearch';
import classes from './search-bar.module.scss';
import { Button } from 'antd';
import { FilterOutlined, MenuOutlined } from '@ant-design/icons';
import FreeTextSearch from '../FreeTextSearch/FreeTextSearch';
import { AnimatePresence, motion } from 'framer-motion';
import { SideSwitchAnimationVariants } from '@/constants/sides.animations.ts';

const SearchBar = () => {
    const [mode, setMode] = useState<'filter' | 'free'>('filter');
    const [direction, setDirection] = useState<'left' | 'right'>('right');

    const handleToggle = (newMode: 'filter' | 'free') => {
        if (newMode !== mode) {
            setDirection(newMode === 'filter' ? 'right' : 'left');
            setMode(newMode);
        }
    };

    return (
        <div className={classes.main}>
            <div className={classes.overlay} />

            <div className={classes.titles}>
                <h1 className={classes.mainTitle}>Find your next soccer experience</h1>
                <p className={classes.secondaryTitle}>View upcoming events, explore personalized packages, and more</p>
            </div>

            <div className={classes.searchZone}>
                <div className={classes.toggleWrapper}>
                    <Button
                        className={`${classes.toggleBtn} ${mode === 'free' ? classes.active : ''}`}
                        onClick={() => handleToggle('free')}
                        icon={<MenuOutlined />}
                    >
                        Free Text Search
                    </Button>
                    <Button
                        className={`${classes.toggleBtn} ${mode === 'filter' ? classes.active : ''}`}
                        onClick={() => handleToggle('filter')}
                        icon={<FilterOutlined />}
                    >
                        Filter Search
                    </Button>
                </div>

                <AnimatePresence mode="wait">
                    {mode === 'filter' ? (
                        <motion.div
                            key="filter"
                            initial={direction === 'right' ? 'hiddenRight' : 'hiddenLeft'}
                            animate="visible"
                            exit={direction === 'right' ? 'exitRight' : 'exitLeft'}
                            variants={SideSwitchAnimationVariants}
                        >
                            <FilterSearch fromFree={direction === 'left'}/>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="free"
                            initial={direction === 'right' ? 'hiddenRight' : 'hiddenLeft'}
                            animate="visible"
                            exit={direction === 'right' ? 'exitRight' : 'exitLeft'}
                            className={classes.freeSearch}
                            variants={SideSwitchAnimationVariants}
                        >
                            <FreeTextSearch setMode={setMode} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SearchBar;
