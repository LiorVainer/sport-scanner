import { SmileOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import styles from './no-history.module.scss';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/constants/routes.const';

export const NoHistory = () => {
    const navigate = useNavigate();

    const handleExplore = () => {
        navigate(ROUTES.HOME);
    };

    return (
        <div className={styles.noHistoryContainer}>
            <SmileOutlined className={styles.icon} />
            <h2>No packages yet</h2>
            <p>You haven’t added any packages to your history yet.</p>
            <Button type="primary" onClick={handleExplore}>
                Explore Packages
            </Button>
        </div>
    );
};
