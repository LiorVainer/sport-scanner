import { useState } from 'react';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Avatar, Button, Form, Input, Typography, Upload } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';

import { AuthService } from '@/api/services/auth.service';
import styles from './auth-page.module.scss';
import { FileService } from '@api/services/file.service.ts';
import { AuthResponse, LoginPayload, RegisterPayload } from '@/models/user.model.ts';
import { useAuth } from '@/context/AuthContext.tsx';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { Screen } from '@components/Screen';
import { AuthFormValidationRules } from '@pages/AuthPage/auth.validation.ts';
import clsx from 'clsx';
import { AuthFormAnimationVariants } from '@pages/AuthPage/auth.animations.ts';
import { ROUTES } from '@/constants/routes.const';

const { Text } = Typography;

export interface RegistrationFormValues {
    username: string;
    email: string;
    password: string;
    picture: string;
}

export const AuthPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { handleAuthResponse } = useAuth();

    const handleGoogleLoginSuccess = async (response: CredentialResponse) => {
        try {
            const { credential } = response;
            if (!credential) {
                throw new Error('No credential received');
            }

            const loginResponse = await AuthService.googleLogin(credential);

            if (!loginResponse) {
                throw new Error('No response received');
            }

            handleAuthResponse(loginResponse);
            navigate(ROUTES.MATCH_EXPERIENCES);
        } catch (error) {
            console.error('Google login error', error);
            setErrorMessage('Google Login failed');
        }
    };

    const onFinish = async (values: RegistrationFormValues) => {
        let uploadedImageUrl = imageUrl;
        let response: AuthResponse | undefined;

        try {
            if (isSignUp) {
                if (selectedFile) {
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    const { data } = await FileService.handleUpload(formData);
                    uploadedImageUrl = data.url.split('public/')[1];
                }
                const user: RegisterPayload = {
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    picture: uploadedImageUrl,
                };

                response = await AuthService.register(user);
            } else {
                const user: LoginPayload = {
                    email: values.email,
                    password: values.password,
                };

                response = await AuthService.login(user);
            }
        } catch (e: unknown) {
            if (e instanceof AxiosError) {
                setErrorMessage('Failed in authentication');
            }
        }

        if (response) {
            handleAuthResponse(response);
            navigate(ROUTES.MATCH_EXPERIENCES);
        }
    };

    return (
        <Screen className={styles.screen}>
            <motion.div
                className={styles.authBox}
                layout
                transition={{ type: 'spring', stiffness: 120, damping: 20, duration: 0.3 }}
            >
                <div className={styles.header}>
                    <h3>{isSignUp ? 'Sign Up' : 'Sign In'}</h3>
                </div>
                <motion.div
                    key={isSignUp ? 'signUp' : 'signIn'}
                    initial={direction === 'right' ? 'hiddenRight' : 'hiddenLeft'}
                    animate="visible"
                    exit={direction === 'right' ? 'exitRight' : 'exitLeft'}
                    variants={AuthFormAnimationVariants}
                    className={styles.authForm}
                >
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        {isSignUp && (
                            <>
                                <Form.Item name="picture">
                                    <Avatar
                                        src={imageUrl || undefined}
                                        icon={!imageUrl ? <UserOutlined /> : undefined}
                                        size={100}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="upload"
                                    className={styles.uploadFormItem}
                                    rules={AuthFormValidationRules.picture}
                                >
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
                                        <Button className={styles.uploadButton} icon={<UploadOutlined />} block>
                                            Upload Your Picture
                                        </Button>
                                    </Upload>
                                </Form.Item>
                                <Form.Item
                                    label="Username"
                                    name="username"
                                    className={styles.inputField}
                                    rules={AuthFormValidationRules.username}
                                >
                                    <Input placeholder="Enter your username" />
                                </Form.Item>
                            </>
                        )}

                        <Form.Item
                            label="Email"
                            name="email"
                            className={styles.inputField}
                            rules={AuthFormValidationRules.email}
                        >
                            <Input placeholder="Enter your email" />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            className={clsx(styles.password, styles.inputField)}
                            rules={AuthFormValidationRules.password}
                        >
                            <Input.Password placeholder="Enter your password" />
                        </Form.Item>

                        {errorMessage && (
                            <Text type="danger" className={styles.errorText}>
                                {errorMessage}
                            </Text>
                        )}

                        <Form.Item>
                            <Button type="primary" htmlType="submit" className={styles.submitButton} block>
                                {isSignUp ? 'Register' : 'Sign In'}
                            </Button>
                        </Form.Item>
                        <Text>
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <Text
                                onClick={() => {
                                    setDirection(isSignUp ? 'left' : 'right');
                                    setIsSignUp(!isSignUp);
                                    form.resetFields();
                                    setErrorMessage(null);
                                }}
                                className={styles.switchText}
                            >
                                {isSignUp ? 'Sign in' : 'Sign up'}
                            </Text>
                        </Text>
                    </Form>
                </motion.div>
                <div className={styles.separator}>
                    <span className={styles.separatorText}>or</span>
                </div>
                <GoogleLogin
                    locale={'en'}
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => setErrorMessage('Google Login failed')}
                />
            </motion.div>
        </Screen>
    );
};

export default AuthPage;
