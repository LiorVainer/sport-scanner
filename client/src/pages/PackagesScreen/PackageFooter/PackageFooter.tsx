import React from 'react';
import { ArrowRightOutlined, CalendarOutlined, DollarOutlined, RightOutlined } from '@ant-design/icons';
import styles from './package-footer.module.scss';
import { Button,Typography } from 'antd';
import { formattedDate } from '@/utils/date.utils';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/constants/routes.const';

const {Text} = Typography

interface PackageFooterProps {
    packageStartDate: string;
    packageEndDate: string;
    packageMinPrice: number;
    packageMaxPrice: number;
    packageId: number;
    packageData: any;
}

const PackageFooter = ({ packageStartDate, packageEndDate,packageMinPrice,packageMaxPrice,packageId,packageData }: PackageFooterProps) => {
    const navigate = useNavigate();

    return (
        <div className={styles.footer}>
            <div className={styles['footer-range-container']}>
                <div>
                    <CalendarOutlined className={styles.icon}/>
                    <Text strong className={styles.range}>
                        {formattedDate(packageStartDate)} <ArrowRightOutlined className={styles['arrow-icon']} />{formattedDate(packageEndDate)}
                    </Text>
                </div>
                <div>
                    <DollarOutlined className={styles.icon}/>
                    <Text strong className={styles.range}>
                        {packageMinPrice}$ <ArrowRightOutlined className={styles['arrow-icon']} />{packageMaxPrice}$
                    </Text>
                </div>
            </div>
            <Button type="primary" onClick={() => navigate(`${ROUTES.PACKAGES}/${packageId}`, { state: packageData })}>Continue<RightOutlined /></Button>
        </div>
    );
};

export default PackageFooter;
