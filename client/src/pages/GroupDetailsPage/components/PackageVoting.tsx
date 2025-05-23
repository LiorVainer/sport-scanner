import React from 'react';
import './styles/PackageVoting.scss';

interface Props {
    percentages: number[];
}

const PackageVoting: React.FC<Props> = ({ percentages }) => {
    return (
        <div className="package-voting">
            <h3>Packages Voting</h3>
            <div className="bars-container">
                {percentages.map((percent, index) => (
                    <div className="vote-bar" key={index}>
                        <div className="bar-bg">
                            <div className="bar-percent" style={{ bottom: `calc(${percent}% + 4px)` }}>
                                {percent}%
                            </div>
                            <div className="bar-fill" style={{ height: `${percent}%` }} />
                        </div>
                        <div className="bar-title">Package {index + 1}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PackageVoting;
