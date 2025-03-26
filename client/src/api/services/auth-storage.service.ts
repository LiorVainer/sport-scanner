export const REFRESH_TOKEN_KEY = 'refreshToken';
export const ACCESS_TOKEN_KEY = 'accessToken';

export const AuthStorageService = {
    storeTokens(accessToken?: string, refreshToken?: string) {
        accessToken && localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        refreshToken && localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },

    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    clearTokens() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};
