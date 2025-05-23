import { ArrowRightOutlined, RightOutlined } from '@ant-design/icons';
import styles from './package-footer.module.scss';
import { Button, Typography } from 'antd';
import { formattedDate } from '@/utils/date.utils';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/constants/routes.const';
import { Package, PackageDocument } from '@/models/packages/package.model.ts';
import { Calendar, CircleDollarSignIcon } from 'lucide-react';
import { UsersService } from '@/api/services/users.service';
import { PackageService } from '@/api/services/package.service';
import clsx from 'clsx';

const { Text } = Typography;

interface PackageFooterProps {
    singlePackage: Package | PackageDocument;
    backRoute?: string;
    actionLabel?: string;
    variant?: 'default' | 'compact';
}

export const PackageFooter = ({ singlePackage, backRoute, actionLabel, variant = 'default' }: PackageFooterProps) => {
    const navigate = useNavigate();
    const { startDate, endDate, totalPrice } = singlePackage;

    const isSavedPackage = (pkg: Package | PackageDocument): pkg is PackageDocument => '_id' in pkg && Boolean(pkg._id);

    const addToHistory = async () => {
        try {
            if (isSavedPackage(singlePackage)) {
                await UsersService.addToUsersHistory(singlePackage._id);
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
        <div>
            <div className={styles.divider} />
            <div className={clsx(styles.footer, variant === 'compact' && styles.compactFooter)}>
                <div className={styles.footerRangeContainer}>
                    <div className={styles.rangeContainer}>
                        <Calendar className={clsx(styles.icon, variant === 'compact' && styles.compactIcon)} />
                        <Text strong className={clsx(styles.range, variant === 'compact' && styles.compactText)}>
                            {formattedDate(startDate)}{' '}
                            <ArrowRightOutlined
                                className={clsx(styles.arrowIcon, variant === 'compact' && styles.compactText)}
                            />
                            {formattedDate(endDate)}
                        </Text>
                    </div>
                    <div className={styles.rangeContainer}>
                        <CircleDollarSignIcon
                            className={clsx(styles.icon, variant === 'compact' && styles.compactIcon)}
                        />
                        <Text strong className={clsx(styles.range, variant === 'compact' && styles.compactText)}>
                            {totalPrice.min}$ - {totalPrice.max}$
                        </Text>
                    </div>
                </div>
                <Button type="primary" onClick={addToHistory}>
                    {actionLabel ?? 'Continue'} <RightOutlined />
                </Button>
            </div>
        </div>
    );
};
