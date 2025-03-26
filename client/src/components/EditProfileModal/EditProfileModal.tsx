import { Avatar, Button, Form, Input, Modal, Upload } from 'antd';
import classes from './edit-profile-modal.module.scss';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { UpdateUserValidationRules } from '@/pages/AuthPage/auth.validation';
import { UserUpdatePayload } from '@/models/user.model';
import { FileService } from '@/api/services/file.service';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/api/constants/query-keys.const';
import { UsersService } from '@/api/services/users.service';
import { getPictureSrcUrl } from '@/utils/picture.utils';

export interface EditProfileModalProps {
    isOpen: boolean;
    handleCancel: () => void;
}

export interface RegistrationFormValues {
    username: string;
    password: string;
    picture: string;
}

export const EditProfileModal = ({ isOpen, handleCancel }: EditProfileModalProps) => {
    const { loggedInUser, doesUserHasGooglePicture } = useAuth();

    const [imageUrl, setImageUrl] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [_errorMessage, setErrorMessage] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const [form] = Form.useForm();

    const onFinish = async (values: RegistrationFormValues) => {
        let uploadedImageUrl: string | undefined = undefined;

        try {
            if (loggedInUser) {
                const isPictureChanged = values.picture !== loggedInUser.picture;
                const isUsernameChanged = values.username !== loggedInUser.username;

                if (selectedFile) {
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    const { data } = await FileService.handleUpload(formData);
                    uploadedImageUrl = data.url.split('public/')[1];
                }

                const user: UserUpdatePayload = {
                    username: isUsernameChanged ? values.username : undefined,
                    picture: uploadedImageUrl,
                };

                if (isPictureChanged && !doesUserHasGooglePicture && uploadedImageUrl) {
                    await FileService.deleteFile(loggedInUser.picture);
                }

                await mutateAsync(user);
                handleCancel();
            }
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                setErrorMessage('Failed in updating user');
            }
        }
    };

    const { mutateAsync } = useMutation({
        mutationKey: [QUERY_KEYS.UPDATE_USER],
        mutationFn: async (user: UserUpdatePayload) => {
            return await UsersService.updateUser(loggedInUser!._id, user);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LOGGED_IN_USER] });
            handleCancel();
        },
    });

    return (
        loggedInUser && (
            <Modal title="Edit User" open={isOpen} onCancel={handleCancel} onOk={() => form.submit()}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className={classes.authForm}
                    initialValues={loggedInUser}
                >
                    <Form.Item name="picture">
                        <Avatar
                            src={imageUrl || getPictureSrcUrl(loggedInUser.picture)}
                            icon={!imageUrl ? <UserOutlined /> : undefined}
                            size={70}
                        />
                    </Form.Item>
                    <Form.Item name="upload" className={classes.uploadFormItem}>
                        <Upload
                            maxCount={1}
                            beforeUpload={(file) => {
                                setSelectedFile(file);

                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    setImageUrl(e.target?.result as string);
                                };
                                reader.readAsDataURL(file);

                                return false;
                            }}
                            onRemove={() => {
                                setImageUrl('');
                                setSelectedFile(null);
                            }}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />} block>
                                Upload Your Picture
                            </Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item
                        label="Username"
                        name="username"
                        className={classes.inputField}
                        rules={UpdateUserValidationRules.username}
                    >
                        <Input placeholder="Enter your username" />
                    </Form.Item>
                </Form>
            </Modal>
        )
    );
};
