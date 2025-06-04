import './GroupDetailsPage.scss';
import GroupHeader from './components/GroupHeader';
import GroupPackageCard from './components/GroupPackageCard';
import PackageVoting from './components/PackageVoting';
import ChosenPackageTimeline from './components/ChosenPackageTimeline';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GroupService } from '@/api/services/group.service';

const GroupDetailsPage = () => {
    const { groupId } = useParams<{ groupId: string }>();

    const { data: group, isLoading } = useQuery({
        queryKey: ['group', groupId],
        queryFn: async () => {
            if (!groupId) throw new Error('Group ID is required');
            return GroupService.getById(groupId);
        },
        enabled: !!groupId,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!group) {
        return <div>Group data not available.</div>;
    }

    const { selectedPackage, suggestedPackages, users, suggestedPackagesVotes } = group;

    const voteCounts =
        suggestedPackagesVotes &&
        Object.values(suggestedPackagesVotes).reduce<Record<string, number>>((acc, packageId) => {
            acc[packageId] = (acc[packageId] ?? 0) + 1;
            return acc;
        }, {});

    const votePercentages = suggestedPackages.map((pkg) => {
        if (voteCounts) {
            const count = voteCounts[pkg._id] || 0;
            return Math.round((count / users.length) * 100);
        }
        return 0;
    });

    const queryClient = useQueryClient();

    const voteMutation = useMutation({
        mutationFn: ({ packageId, operation }: { packageId: string; operation: 'vote' | 'unvote' }) => {
            return operation === 'vote'
                ? GroupService.vote(groupId!, packageId)
                : GroupService.unVote(groupId!);
        },
        onSuccess: (updatedGroup) => {
            queryClient.setQueryData(['group', groupId], updatedGroup);
        },
        onError: (error) => {
            console.error('Error while voting:', error);
        },
    });

    const handleVoting = (packageId: string, operation: 'vote' | 'unvote') => {
        voteMutation.mutate({ packageId, operation });
    };

    return (
        <div className="group-details">
            <div className="content-wrapper">
                <GroupHeader group={group} />
                <h3 className="section-title">Tailored Packages for Your Group</h3>
                <div className="packages-grid">
                    {suggestedPackages &&
                        suggestedPackages.length > 0 &&
                        suggestedPackages.map((pkg) => (
                            <GroupPackageCard
                                key={pkg._id}
                                pkg={pkg}
                                isVoted={
                                    suggestedPackagesVotes
                                        ? Object.entries(suggestedPackagesVotes).some(([_, v]) => v === pkg._id)
                                        : false
                                }
                                handleVoting={(operation: 'vote' | 'unvote') => handleVoting(pkg._id, operation)}
                            />
                        ))}
                </div>
                <PackageVoting percentages={votePercentages} />
                {selectedPackage && <ChosenPackageTimeline pkg={selectedPackage} backRoute="/group/group_id" />}
            </div>
        </div>
    );
};

export default GroupDetailsPage;
