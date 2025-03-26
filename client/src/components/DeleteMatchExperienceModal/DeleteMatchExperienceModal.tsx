import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { MatchExperienceService } from '@api/services/match-experience.service.ts';
import { QUERY_KEYS } from '@api/constants/query-keys.const.ts';
import { Button, message, Modal } from 'antd';
import { ROUTES } from '@/constants/routes.const';

interface DeleteMatchExperienceModalProps {
    matchExperienceId: string;
    onClose: () => void;
}

export const DeleteMatchExperienceModal = ({ matchExperienceId, onClose }: DeleteMatchExperienceModalProps) => {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { mutate: deleteMutate, isPending } = useMutation({
        mutationFn: () => MatchExperienceService.deleteMatchExperience(matchExperienceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MATCH_EXPERIENCE] });
            navigate(ROUTES.MATCH_EXPERIENCES);
            message.success('Match Experience Deleted successfully');
            onClose();
        },
    });

    const handleCancel = () => {
        setIsModalOpen(false);
        onClose();
    };

    return (
        <Modal
            title="Delete Match Experience"
            open={isModalOpen}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel} disabled={isPending}>
                    Cancel
                </Button>,
                <Button key="confirm" type="primary" danger onClick={() => deleteMutate()} loading={isPending}>
                    Confirm
                </Button>,
            ]}
        >
            <p>Are you sure you want to delete this match experience? This action cannot be undone.</p>
        </Modal>
    );
};
