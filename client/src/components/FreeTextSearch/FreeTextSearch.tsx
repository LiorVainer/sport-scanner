import { useRef, useState } from 'react';
import { Form, Input, Spin } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import classes from './free-text-search.module.scss';
import { usePackages } from '@/context/PackagesContext';
import { useLocalStorage } from '@/hooks/useLocalStorage.hooks';
import { PackagesGenerationFormValues } from '@/models/packages/package-generate-params.model';
import { calcDefaultGenerateParams } from '../FilterSearch';

export interface FreeTextSearchProps {
    setMode: (mode: 'filter' | 'free') => void;
}

const FreeTextSearch = ({ setMode }: FreeTextSearchProps) => {
    const defaultGenerateParamsRef = useRef(calcDefaultGenerateParams());
    const [searchText, setSearchText] = useState('');
    const { parseFreeTextSearchIntoGenerationParams, isParsingFreeTextSearch } = usePackages();
    const [_storedSearchParams, setStoredSearchParams] = useLocalStorage<PackagesGenerationFormValues>(
        'searchParams',
        defaultGenerateParamsRef.current
    );

    const handleSubmit = async () => {
        if (searchText) {
            const { country, league, teams, ...rest } = await parseFreeTextSearchIntoGenerationParams(searchText);

            if (country || league || (teams && teams.length > 0)) {
                setStoredSearchParams({
                    ...rest,
                    ...(country ? { country } : {}),
                    ...(league ? { league } : {}),
                    ...(teams && teams.length > 0 ? { teams } : {}),
                });
            }

            setMode('filter');
        }
    };
    return (
        <Form layout="vertical" className={classes.freeTextSearch} onFinish={handleSubmit}>
            <Input
                placeholder="Search for events, teams, or cities"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="large"
                className={classes.searchInput}
            />
            <button type="submit" className={classes.searchButton} disabled={!searchText || isParsingFreeTextSearch}>
                {isParsingFreeTextSearch ? (
                    <Spin indicator={<LoadingOutlined spin style={{ color: 'white' }} />} />
                ) : (
                    <SearchOutlined />
                )}
                Search
            </button>
        </Form>
    );
};

export default FreeTextSearch;
