import React from 'react';
import './styles/ChosenPackageTimeline.scss';
import { PackageCard } from '@/components/PackageCard';
import { Package } from '@/models/packages/package.model';

interface Props {
    pkg: Package;
    backRoute?: string;
}

const ChosenPackageTimeline: React.FC<Props> = ({ pkg, backRoute }) => {
    return (
        <div className="chosen-package">
            <h3>Chosen Package By Group</h3>

            <div className="packageContainer">
                <PackageCard singlePackage={pkg} backRoute={backRoute} />
            </div>
        </div>
    );
};

export default ChosenPackageTimeline;
