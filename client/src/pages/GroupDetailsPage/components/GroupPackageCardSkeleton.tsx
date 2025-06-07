import React from 'react';
import { Skeleton } from 'antd';
import './styles/PackageCard.scss';

const GroupPackageCardSkeleton: React.FC = () => {
    return (
        <div className="package-card">
            <div className="card-header">
                <Skeleton.Input style={{ width: 100, height: 20 }} active />
                <Skeleton.Button style={{ width: 80, height: 32 }} active />
            </div>

            <hr className="divider" />

            <div className="card-content">
                {/* Simulate 2-3 matches */}
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="match-row">
                        <Skeleton.Avatar size={24} shape="square" active />
                        <Skeleton.Input style={{ width: 180, height: 20 }} active />
                        <Skeleton.Avatar size={24} shape="square" active />
                    </div>
                ))}

                {/* Date range and price range */}
                <div className="date-range">
                    <Skeleton.Input style={{ width: 150, height: 16, marginTop: 8 }} active />
                </div>
                <div className="price-range">
                    <Skeleton.Input style={{ width: 120, height: 16, marginTop: 8 }} active />
                </div>
            </div>

            <div className="card-footer">
                <Skeleton.Button style={{ width: 100, height: 32 }} active />
            </div>
        </div>
    );
};

export default GroupPackageCardSkeleton;
