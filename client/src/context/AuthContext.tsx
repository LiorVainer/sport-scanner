import { createContext, useContext, useMemo } from 'react';
import { AuthStorageService } from '@api/services/auth-storage.service.ts';
import { AuthResponse, PublicUser } from '@/models/user.model.ts';
import { AuthService } from '@api/services/auth.service.ts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../api/constants/query-keys.const';

interface AuthContextType {
    loggedInUser: PublicUser | null | undefined;
    isLoading: boolean;
    isGoogleUser: boolean;
    doesUserHasGooglePicture: boolean;
    handleAuthResponse: (authResponse: AuthResponse) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const queryClient = useQueryClient();
    const { data: loggedInUser, isLoading } = useQuery<PublicUser | null>({
        queryKey: [QUERY_KEYS.LOGGED_IN_USER],
        queryFn: async () => {
            const accessToken = AuthStorageService.getAccessToken();
            if (!accessToken) return null;
            return await AuthService.me();
        },
        retry: 1,
    });

    const doesUserHasGooglePicture = useMemo(() => loggedInUser?.picture.includes('https') ?? false, [loggedInUser]);
    const isGoogleUser = useMemo(() => !!loggedInUser?.googleId, [loggedInUser]);

    const logoutMutation = useMutation({
        mutationFn: async () => {
            const refreshToken = AuthStorageService.getRefreshToken();
            if (!refreshToken) return;

            await AuthService.logout(refreshToken);
            AuthStorageService.clearTokens();
        },
        onSuccess: () => {
            queryClient.setQueryData([QUERY_KEYS.LOGGED_IN_USER], null);
        },
    });

    const handleAuthResponse = (authResponse: AuthResponse) => {
        AuthStorageService.storeTokens(authResponse.accessToken, authResponse.refreshToken);
        const { refreshToken, accessToken, ...publicUser } = authResponse;
        queryClient.setQueryData([QUERY_KEYS.LOGGED_IN_USER], publicUser); // Update cached user
    };

    return (
        <AuthContext.Provider
            value={{
                loggedInUser,
                isLoading,
                isGoogleUser,
                handleAuthResponse,
                logout: logoutMutation.mutate,
                doesUserHasGooglePicture,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
