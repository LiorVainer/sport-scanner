import { useRef, useState } from 'react';
import { Form, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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
    const { parseTextIntoParams } = usePackages();
    const [_storedSearchParams, setStoredSearchParams] = useLocalStorage<PackagesGenerationFormValues>(
        'searchParams',
        defaultGenerateParamsRef.current
    );

    const handleSubmit = async () => {
        if (searchText) {
            const params = await parseTextIntoParams(searchText);
            setStoredSearchParams(params);
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
            <button type="submit" className={classes.searchButton} disabled={!searchText}>
                <SearchOutlined />
                Search
            </button>
        </Form>
    );
};

export default FreeTextSearch;
