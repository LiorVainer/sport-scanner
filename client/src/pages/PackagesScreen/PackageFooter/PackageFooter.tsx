import { ArrowRightOutlined, RightOutlined } from '@ant-design/icons';
import styles from './package-footer.module.scss';
import { Button, Typography } from 'antd';
import { formattedDate } from '@/utils/date.utils';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/constants/routes.const';
import { Package, PackageDocument } from '@/models/package.model';
import { Calendar, CircleDollarSignIcon } from 'lucide-react';
import { HistoryService } from '@/api/services/history.service';

const { Text } = Typography;

interface PackageFooterProps {
    singlePackage: Package | PackageDocument;
    backRoute?: string;
}

export const PackageFooter = ({ singlePackage, backRoute }: PackageFooterProps) => {
    const navigate = useNavigate();
    const { fromDate, toDate, totalPrice } = singlePackage;

    const addToHistory = async () => {
        try {
            // if (blockAddingToHistory) {
            //     navigate(`${ROUTES.PACKAGES}/results/${(singlePackage as PackageDocument)._id}`, {
            //         state: {
            //             singlePackage,
            //             packageId: (singlePackage as PackageDocument)._id,
            //             backRoute,
            //         },
            //     });
            // } else {
            const result = await HistoryService.addToUsersHistory(singlePackage);
            navigate(`${ROUTES.PACKAGES}/results/${result.packageId}`, {
                state: { singlePackage, packageId: result.packageId, backRoute },
            });
            // }
        } catch (error) {
            console.error('Error adding package to history:', (error as any).message);
        }
    };

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
            <Button type="primary" onClick={addToHistory}>
                Continue
                <RightOutlined />
            </Button>
        </div>
    );
};
