import { ArrowRightOutlined, RightOutlined } from '@ant-design/icons';
import styles from './package-footer.module.scss';
import { Button, Typography } from 'antd';
import { formattedDate } from '@/utils/date.utils';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/constants/routes.const';
import { Package } from '@/models/package.model';
import { Calendar, CircleDollarSignIcon } from 'lucide-react';

const { Text } = Typography;

interface PackageFooterProps {
    singlePackage: Package;
}

export const PackageFooter = ({ singlePackage }: PackageFooterProps) => {
    const navigate = useNavigate();
    const { fromDate, toDate, totalPrice, id } = singlePackage;

    return (
        <div className={styles.footer}>
            <div className={styles.footerRangeContainer}>
                <div className={styles.rangeContainer}>
                    <Calendar className={styles.icon} />
                    <Text strong className={styles.range}>
                        {formattedDate(fromDate)} <ArrowRightOutlined className={styles.arrowIcon} />
                        {formattedDate(toDate)}
                    </Text>
                </div>
                <div className={styles.rangeContainer}>
                    <CircleDollarSignIcon className={styles.icon} />
                    <Text strong className={styles.range}>
                        {totalPrice.min}$ <ArrowRightOutlined className={styles.arrowIcon} />
                        {totalPrice.max}$
                    </Text>
                </div>
            </div>
            <Button
                type="primary"
                onClick={() => navigate(`${ROUTES.PACKAGES}/results/${id}`, { state: singlePackage })}
            >
                Continue
                <RightOutlined />
            </Button>
        </div>
    );
};
