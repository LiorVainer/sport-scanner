import React from 'react';
import './styles/PackageCard.scss';
import { PackageWithId } from '@/models/packages/package.model';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FireFilled, LikeOutlined, RightOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface Props {
    pkg: PackageWithId;
    onVote: (userId: string) => void;
    isVoted: boolean;
}

const PackageCard: React.FC<Props> = ({ pkg, onVote, isVoted }) => {
    const { loggedInUser } = useAuth();
    const currentUserId = loggedInUser?._id;
    const navigate = useNavigate();
    const location = useLocation();

    const handleDetailsClick = () => {
        navigate(`/package/${pkg._id}`, {
            state: { backRoute: location.pathname },
        });
    };

    return (
        <div className="package-card">
            <div className="card-header">
                <div className="package-label">Package {pkg._id}</div>
                <button
                    className={`vote-btn ${isVoted ? 'voted' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!currentUserId) return;
                        onVote(currentUserId);
                    }}
                >
                    {isVoted ? <FireFilled style={{ marginRight: 6 }} /> : <LikeOutlined style={{ marginRight: 6 }} />}
                    {isVoted ? 'Unvote' : 'Vote'}
                </button>
            </div>

            <hr className="divider" />

            <div className="card-content">
                {pkg.timeline
                    .filter((item) => item.type === 'destination')
                    .flatMap((destination) =>
                        destination.matches.map((match) => (
                            <div key={match.id} className="match-row">
                                <img src={match.homeTeam.logo} alt={match.homeTeam.name} />
                                <span>
                                    {match.homeTeam.name} VS {match.awayTeam.name}
                                </span>
                                <img src={match.awayTeam.logo} alt={match.awayTeam.name} />
                            </div>
                        ))
                    )}
                <p className="date-range">
                    📅 {pkg.startDate} → {pkg.endDate}
                </p>
                <p className="price-range">
                    💶 €{pkg.totalPrice.min} - €{pkg.totalPrice.max}
                </p>
            </div>

            <div className="card-footer">
                <Button type="primary" className="vote-btn" onClick={handleDetailsClick}>
                    Continue <RightOutlined />
                </Button>
            </div>
        </div>
    );
};

export default PackageCard;
