import { useState } from 'react';
import { Form, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import classes from './free-text-search.module.scss';
import { useNavigate } from 'react-router';
import { usePackages } from '@/context/PackagesContext';
import { ROUTES } from '@/constants/routes.const';

const FreeTextSearch = () => {
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();
    const { fetchPackages } = usePackages();

    const handleSubmit = () => {
        if (searchText) {
            navigate(ROUTES.PACKAGES);
            fetchPackages({
                freeText: searchText,
            });
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
