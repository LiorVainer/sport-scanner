import { useState } from 'react';
import { Button, Form, Input } from 'antd';
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
            console.log('Searching for:', searchText);
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
            <Button
                type="primary"
                icon={
                    <span className={classes.iconWrapper}>
                        <SearchOutlined className={classes.searchIcon} />
                    </span>
                }
                shape="round"
                size="large"
                htmlType="submit"
                disabled={!searchText}
            >
                Search
            </Button>
        </Form>
    );
};

export default FreeTextSearch;
