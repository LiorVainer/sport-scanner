import { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { reactQueryClient } from '@/api/config/query-client';
import { AntdProvider } from '@/context/AntdProvider.tsx';
import { AuthProvider } from '@/context/AuthContext.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '@/constants/google.const.ts';

export const GlobalContextProvider = ({ children }: PropsWithChildren<{}>) => {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AntdProvider>
                <QueryClientProvider client={reactQueryClient}>
                    <AuthProvider>{children}</AuthProvider>
                </QueryClientProvider>
            </AntdProvider>
        </GoogleOAuthProvider>
    );
};
