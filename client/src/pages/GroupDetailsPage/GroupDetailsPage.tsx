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
import { Button, Typography } from 'antd';
import { Shuffle, ThumbsDown, ThumbsUp } from 'lucide-react';

const GroupDetailsPage = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const queryClient = useQueryClient();
    const generationTriggered = useRef(false);

    const { data: group, isLoading } = useQuery({
        queryKey: ['group', groupId],
        queryFn: async () => {
            if (!groupId) throw new Error('Group ID is required');
            return GroupService.getById(groupId);
        },
        enabled: !!groupId,
    });

    const generatePackagesMutation = useMutation({
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

    useEffect(() => {
        if (
            groupId &&
            group &&
            !generationTriggered.current &&
            (!group.suggestedPackages || group.suggestedPackages.length === 0)
        ) {
            generationTriggered.current = true;
            generatePackagesMutation.mutate();
        }
    }, [groupId, group]);

    const voteMutation = useMutation({
        mutationFn: ({ packageId, operation }: { packageId: string; operation: 'vote' | 'unvote' }) => {
            return operation === 'vote' ? GroupService.vote(groupId!, packageId) : GroupService.unVote(groupId!);
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

    const votePercentages =
        suggestedPackages?.map((pkg) => {
            if (voteCounts) {
                const count = voteCounts[pkg._id] || 0;
                return Math.round((count / users.length) * 100);
            }
            return 0;
        }) || [];

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
                            loading={generatePackagesMutation.isPending}
                            onClick={() => generatePackagesMutation.mutate()}
                        >
                            Suggest New Packages
                        </Button>
                    </div>

                    <div className="packages-grid">
                        {generatePackagesMutation.isPending
                            ? Array.from({ length: 4 }).map((_, index) => (
                                  <PackageSkeleton key={index} variant="compact" />
                              ))
                            : suggestedPackages?.length > 0 &&
                              suggestedPackages.map((pkg, index) => {
                                  const hasVoted = suggestedPackagesVotes
                                      ? Object.values(suggestedPackagesVotes).includes(pkg._id)
                                      : false;
                                  return (
                                      <div className="package-new-card" key={pkg._id}>
                                          <div className="package-card-header">
                                              <Typography className="package-index">{`Package ${index + 1}`}</Typography>
                                              <Button
                                                  className="vote-button"
                                                  type="primary"
                                                  icon={hasVoted ? <ThumbsDown size={16} /> : <ThumbsUp size={16} />}
                                                  onClick={() => handleVoting(pkg._id, hasVoted ? 'unvote' : 'vote')}
                                              >
                                                  {hasVoted ? 'Unvote' : 'Vote'}
                                              </Button>
                                          </div>
                                          <PackageCard variant="compact" singlePackage={pkg} />
                                      </div>
                                  );
                              })}
                    </div>
                </div>

                {!generatePackagesMutation.isPending && suggestedPackages?.length > 0 && (
                    <PackageVoting percentages={votePercentages} />
                )}

                {selectedPackage && <ChosenPackageTimeline pkg={selectedPackage} backRoute={`/group/${groupId}`} />}
            </div>
        </div>
    );
};

export default GroupDetailsPage;
