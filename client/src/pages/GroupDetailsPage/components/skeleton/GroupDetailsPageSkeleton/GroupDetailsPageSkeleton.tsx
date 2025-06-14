import { Button } from 'antd';
import '../../../GroupDetailsPage.scss';
import { PackageSkeleton } from '@pages/PackagesScreen/PackageSkeleton';
import { GroupHeaderSkeleton } from '@pages/GroupDetailsPage/components/skeleton/GroupHeaderSkeleton/GroupHeaderSkeleton.tsx';
import { Shuffle } from 'lucide-react';

import { PackageVotingSkeleton } from '@pages/GroupDetailsPage/components/skeleton/PackageVotingSkeleton';

export const GroupDetailsPageSkeleton = () => {
    return (
        <div className="group-details">
            <div className="content-wrapper">
                <GroupHeaderSkeleton />

                <div className="suggested-packages-container">
                    <div className="suggested-packages-header">
                        <h3 className="section-title">Tailored Packages for Your Group</h3>
                        <Button className="regenerate-packages-button" icon={<Shuffle size={16} />} type="primary">
                            Suggest New Packages
                        </Button>
                    </div>

                    <div className="packages-grid">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <PackageSkeleton key={index} variant="compact" />
                        ))}
                    </div>
                </div>

                <PackageVotingSkeleton />
            </div>
        </div>
    );
};
