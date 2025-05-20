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
                {percentages.map((percent, i) => (
                    <div className="vote-bar" key={i}>
                        <div className="bar-wrapper">
                            <div className="bar-bg">
                                <div className="bar-fill" style={{ height: `${percent}%` }} />
                            </div>
                            <div className="bar-label">{percent}%</div>
                        </div>
                        <p>Package {i + 1}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PackageVoting;
