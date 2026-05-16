import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { decodeJWT } from '@/src/lib/jwt';

interface UserProfile {
    id: number;
    accountId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    phoneNumber: string;
    roles: string[];
}

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: UserProfile | null;
    isAuthenticated: boolean;
    isOrganization: boolean;
    organizationId: number;
}

const initialState: AuthState = {
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isOrganization: false,
    organizationId: -1,
};

function applyTokenClaims(state: AuthState, token: string) {
    const payload = decodeJWT(token);

    state.isAuthenticated = true;

    if (!payload) {
        state.isOrganization = false;
        state.organizationId = -1;
        return;
    }

    state.isOrganization = Boolean(payload.isOrganization);
    state.organizationId = payload.organizationId ?? -1;

    if (state.user) {
        state.user.roles = payload.roles ?? state.user.roles;
    }
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ token: string; refreshToken?: string; user?: UserProfile }>) => {
            state.token = action.payload.token;
            if (action.payload.refreshToken) {
                state.refreshToken = action.payload.refreshToken;
            }
            if (action.payload.user) {
                state.user = action.payload.user;
            }

            applyTokenClaims(state, action.payload.token);
        },

        setUser: (state, action: PayloadAction<UserProfile>) => {
            state.user = action.payload;
        },

        updateToken: (state, action: PayloadAction<{ token: string; refreshToken?: string }>) => {
            state.token = action.payload.token;
            if (action.payload.refreshToken) {
                state.refreshToken = action.payload.refreshToken;
            }

            applyTokenClaims(state, action.payload.token);
        },

        logout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.user = null;
            state.isAuthenticated = false;
            state.isOrganization = false;
            state.organizationId = -1;
        },
    },
});

export const { setCredentials, setUser, updateToken, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsOrganization = (state: { auth: AuthState }) => state.auth.isOrganization;
