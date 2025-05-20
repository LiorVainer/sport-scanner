import React from 'react';
import './styles/PackageCard.scss';
import { Package } from '@/models/packages/package.model';

interface Props {
    pkg: Package;
    onVote: (userId: string) => void;
}

const currentUserId = '1';

const PackageCard: React.FC<Props> = ({ pkg, onVote }) => {
    return (
        <div className="package-card">
            <div className="card-header">
                <div className="package-label">Package {pkg.id}</div>
                <button className="vote-btn" onClick={() => onVote(currentUserId)}>
                    👍 Vote
                </button>
            </div>

            <hr className="divider" />

            <div className="card-content">
                {pkg.timeline
                    .filter((t) => t.type === 'destination')
                    .flatMap((d: any) =>
                        d.matches.map((m: any) => (
                            <div key={m.id} className="match-row">
                                <img src={m.homeTeam.logo} alt={m.homeTeam.name} />
                                <span>
                                    {m.homeTeam.name} VS {m.awayTeam.name}
                                </span>
                                <img src={m.awayTeam.logo} alt={m.awayTeam.name} />
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
        </div>
    );
};

export default PackageCard;
