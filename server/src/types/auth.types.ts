export type Tokens = {
    accessToken: string,
    refreshToken: string
}

export type RefreshTokenBody = {
    refreshToken: string
}

export type RefreshResponse = {
    accessToken: string,
    refreshToken: string,
    _id: string
}

export type UserCredentials = {
    email: string;
    password: string;
}