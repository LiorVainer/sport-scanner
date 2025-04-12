import { HeartOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import styles from './no-saved-packages.module.scss';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/constants/routes.const';

export const NoSavedPackages = () => {
    const navigate = useNavigate();

    const handleExplore = () => {
        navigate(ROUTES.HOME);
    };

    return (
        <div className={styles.noSavedPackagesContainer}>
            <HeartOutlined className={styles.icon} />
            <h2>No packages yet</h2>
            <p>You haven’t saved any packages yet.</p>
            <Button type="primary" onClick={handleExplore}>
                Explore Packages
            </Button>
        </div>
    );
};
