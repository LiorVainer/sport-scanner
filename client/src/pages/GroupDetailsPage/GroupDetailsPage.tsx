import { useEffect, useRef } from 'react';
import './GroupDetailsPage.scss';
import GroupHeader from './components/GroupHeader';
import PackageVoting from './components/PackageVoting';
import ChosenPackageTimeline from './components/ChosenPackageTimeline';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GroupService } from '@/api/services/group.service';
import { PackageCard } from '@components/PackageCard';
import { PackageSkeleton } from '@pages/PackagesScreen/PackageSkeleton';
import { Button } from 'antd';
import { Shuffle, ThumbsDown, ThumbsUp } from 'lucide-react';

const GroupDetailsPage = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const queryClient = useQueryClient();

    const { data: group, isLoading } = useQuery({
        queryKey: ['group', groupId],
        queryFn: async () => {
            if (!groupId) throw new Error('Group ID is required');
            return GroupService.getById(groupId);
        },
        enabled: !!groupId,
    });

    const { mutateAsync: generateSuggestedPackages, isPending: isGeneratingSuggestedPackages } = useMutation({
        mutationKey: ['generate-group-suggested-packages', groupId],
        mutationFn: async () => {
            if (!groupId) throw new Error('Group ID is required');
            return GroupService.generateSuggestedPackages(groupId);
        },
        onSuccess: () => {
            void queryClient.refetchQueries({ queryKey: ['group', groupId] });
        },
        retry: 0,
    });

    const generationTriggered = useRef(false);

    useEffect(() => {
        if (
            groupId &&
            !generationTriggered.current &&
            group &&
            (!group?.suggestedPackages || group.suggestedPackages.length === 0)
        ) {
            generationTriggered.current = true;
            void generateSuggestedPackages();
        }
    }, [groupId, group?.suggestedPackages, generateSuggestedPackages]);

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

                <div className="suggested-packages-container">
                    <div className="suggested-packages-header">
                        <h3 className="section-title">Tailored Packages for Your Group</h3>
                        <Button
                            className="regenerate-packages-button"
                            icon={<Shuffle size={16} />}
                            type="primary"
                            onClick={() => generateSuggestedPackages()}
                        >
                            Suggest New Packages
                        </Button>
                    </div>
                    <div className="packages-grid">
                        {isGeneratingSuggestedPackages
                            ? Array.from({ length: 4 }).map((_, index) => (
                                  <PackageSkeleton key={index} variant={'compact'} />
                              ))
                            : suggestedPackages &&
                              suggestedPackages.length > 0 &&
                              suggestedPackages.map((pkg) => {
                                  const hasVoted = false;
                                  return (
                                      <div className="package-new-card" key={pkg._id}>
                                          <Button
                                              className="vote-button"
                                              type="primary"
                                              icon={hasVoted ? <ThumbsDown size={16} /> : <ThumbsUp size={16} />}
                                              onClick={() => {}}
                                          >
                                              {hasVoted ? 'Unvote' : 'Vote'}
                                          </Button>
                                          <PackageCard variant="compact" singlePackage={pkg} />
                                      </div>
                                  );
                              })}
                    </div>
                </div>
                <PackageVoting percentages={votePercentages} />
                {selectedPackage && <ChosenPackageTimeline pkg={selectedPackage} backRoute="/group/group_id" />}
            </div>
        </div>
    );
};

export default GroupDetailsPage;
