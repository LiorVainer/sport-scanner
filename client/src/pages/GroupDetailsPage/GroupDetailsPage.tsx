import React, { useState, useMemo } from 'react';
import './GroupDetailsPage.scss';
import GroupHeader from './components/GroupHeader';
import GroupPackageCard from './components/GroupPackageCard';
import PackageVoting from './components/PackageVoting';
import ChosenPackageTimeline from './components/ChosenPackageTimeline';
import { mockData } from './mockData';
import { PackageWithId } from '@/models/packages/package.model';

const GroupDetailsPage: React.FC = () => {
    const [votes, setVotes] = useState<Record<string, number>>({});
    const users = mockData.users;
    const totalUsers = users.length;

    const allPackages: PackageWithId[] = Array(6)
        .fill(mockData.selectedPackage)
        .map((pkg, index) => ({
            ...pkg,
            id: index + 1,
            title: `Package ${index + 1}`,
        }));

    const voteCounts = useMemo(() => {
        return Object.values(votes).reduce<Record<number, number>>((acc, packageId) => {
            acc[packageId] = (acc[packageId] ?? 0) + 1;
            return acc;
        }, {});
    }, [votes]);

    const votePercentages = useMemo(() => {
        return allPackages.map((pkg) => {
            const count = voteCounts[Number(pkg._id)] || 0;
            return Math.round((count / totalUsers) * 100);
        });
    }, [voteCounts, totalUsers, allPackages]);

    const maxVotes = Math.max(...Object.values(voteCounts), 0);
    const chosenPackageIds = Object.entries(voteCounts)
        .filter(([_, count]) => count === maxVotes)
        .map(([pkgId]) => +pkgId);

    const chosenPackage = allPackages.find((pkg) => Number(pkg._id) === chosenPackageIds[0]);

    const handleVote = (userId: string, packageId: number) => {
        setVotes((prev) => {
            if (prev[userId] === packageId) {
                const newVotes = { ...prev };
                delete newVotes[userId];
                return newVotes;
            }
            return {
                ...prev,
                [userId]: packageId,
            };
        });
    };

    return (
        <div className="group-details">
            <div className="content-wrapper">
                <GroupHeader title={mockData.title} users={users} selectedPackage={mockData.selectedPackage} />
                <h3 className="section-title">Tailored Packages for Your Group</h3>
                <div className="packages-grid">
                    {allPackages.map((pkg) => (
                        <GroupPackageCard
                            key={pkg._id}
                            pkg={pkg}
                            isVoted={Object.entries(votes).some(([_, v]) => v === Number(pkg._id))}
                            onVote={(userId) => handleVote(userId, Number(pkg._id))}
                        />
                    ))}
                </div>
                <PackageVoting percentages={votePercentages} />
                {chosenPackage && <ChosenPackageTimeline pkg={chosenPackage} backRoute="/group/group_id" />}
            </div>
        </div>
    );
};

export default GroupDetailsPage;
