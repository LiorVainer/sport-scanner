import { ArrowRightOutlined, RightOutlined } from '@ant-design/icons';
import styles from './package-footer.module.scss';
import { Button, Typography } from 'antd';
import { formattedDate } from '@/utils/date.utils';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/constants/routes.const';
import { Package, PackageDocument } from '@/models/package.model';
import { Calendar, CircleDollarSignIcon } from 'lucide-react';
import { UsersService } from '@/api/services/users.service';
import { PackageService } from '@/api/services/package.service';

const { Text } = Typography;

interface PackageFooterProps {
    singlePackage: Package | PackageDocument;
    backRoute?: string;
}

export const PackageFooter = ({ singlePackage, backRoute }: PackageFooterProps) => {
    const navigate = useNavigate();
    const { fromDate, toDate, totalPrice } = singlePackage;

    const isSavedPackage = (pkg: Package | PackageDocument): pkg is PackageDocument => {
        return '_id' in pkg && Boolean(pkg._id);
    };

    const addToHistory = async () => {
        try {
            if (isSavedPackage(singlePackage)) {
                const { _id, ...rest } = singlePackage;
                const newPackage = await PackageService.create(rest);
                await UsersService.addToUsersHistory(newPackage._id);
                navigate(`${ROUTES.PACKAGES}/${singlePackage._id}`, {
                    state: { singlePackage, packageId: singlePackage._id!, backRoute },
                });
            } else {
                const newPackage = await PackageService.create(singlePackage);
                const result = await UsersService.addToUsersHistory(newPackage._id);
                navigate(`${ROUTES.PACKAGES}/${result.packageId}`, {
                    state: { singlePackage, packageId: result.packageId, backRoute },
                });
            }
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
