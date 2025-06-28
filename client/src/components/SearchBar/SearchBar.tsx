import { useState } from 'react';
import FilterSearch from '../FilterSearch/FilterSearch';
import classes from './search-bar.module.scss';
import { Button } from 'antd';
import { FilterOutlined, MenuOutlined } from '@ant-design/icons';
import FreeTextSearch from '../FreeTextSearch/FreeTextSearch';

const SearchBar = () => {
    const [mode, setMode] = useState<'filter' | 'free'>('filter');

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
                        onClick={() => setMode('free')}
                        icon={<MenuOutlined />}
                    >
                        Free Text Search
                    </Button>
                    <Button
                        className={`${classes.toggleBtn} ${mode === 'filter' ? classes.active : ''}`}
                        onClick={() => setMode('filter')}
                        icon={<FilterOutlined />}
                    >
                        Filter Search
                    </Button>
                </div>

                {mode === 'filter' ? <FilterSearch /> : <FreeTextSearch setMode={setMode} />}
            </div>
        </div>
    );
};

export default SearchBar;
