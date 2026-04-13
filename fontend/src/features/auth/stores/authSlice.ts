import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '@/src/utils/api';

interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
    staffRole?: string;
    phoneNumber?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    registerSuccess: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null,
    registerSuccess: false,
};
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Email hoặc mật khẩu không chính xác');
            }

            // API trả về { accessToken, refreshToken }
            // Decode JWT payload (base64) để lấy user info (sub, email, role)
            const token = data.accessToken;
            if (!token) throw new Error('Không nhận được token từ server');

            localStorage.setItem('ticketbox_token', token);
            localStorage.setItem('ticketbox_refresh_token', data.refreshToken);

            // Decode JWT payload (base64) correctly for UTF-8 (Vietnamese characters)
            const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const decodedPayload = JSON.parse(decodeURIComponent(atob(payloadBase64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')));

            return {
                token,
                refreshToken: data.refreshToken,
                user: {
                    id: decodedPayload.sub,
                    email: decodedPayload.email,
                    name: decodedPayload.name || credentials.email.split('@')[0],
                    role: decodedPayload.role,
                    phoneNumber: decodedPayload.phoneNumber,
                    staffRole: decodedPayload.staffRole,
                }
            };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Thunk để khôi phục session khi reload trang
export const rehydrateUser = createAsyncThunk(
    'auth/rehydrate',
    async (_, { rejectWithValue }) => {
        try {
            if (typeof window === 'undefined') return null;
            const token = localStorage.getItem('ticketbox_token');
            const refreshToken = localStorage.getItem('ticketbox_refresh_token');

            if (!token) return null;

            // Decode token để lấy thông tin user (UTF-8 safe)
            const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const decodedPayload = JSON.parse(decodeURIComponent(atob(payloadBase64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')));

            // Kiểm tra hết hạn (exp là giây)
            const currentTime = Date.now() / 1000;
            if (decodedPayload.exp < currentTime) {
                // Access Token hết hạn, thử refresh
                if (refreshToken) {
                    const response = await fetch(`${API_URL}/auth/refresh-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        localStorage.setItem('ticketbox_token', data.accessToken);
                        localStorage.setItem('ticketbox_refresh_token', data.refreshToken);

                        const payloadBase64 = data.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
                        const newPayload = JSON.parse(decodeURIComponent(atob(payloadBase64).split('').map(function (c) {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join('')));
                        return {
                            token: data.accessToken,
                            refreshToken: data.refreshToken,
                            user: {
                                id: newPayload.sub,
                                email: newPayload.email,
                                name: newPayload.name,
                                role: newPayload.role,
                                phoneNumber: newPayload.phoneNumber,
                                staffRole: newPayload.staffRole,
                            }
                        };
                    }
                }
                localStorage.removeItem('ticketbox_token');
                localStorage.removeItem('ticketbox_refresh_token');
                return null;
            }

            return {
                token,
                refreshToken,
                user: {
                    id: decodedPayload.sub,
                    email: decodedPayload.email,
                    name: decodedPayload.name,
                    role: decodedPayload.role,
                    phoneNumber: decodedPayload.phoneNumber,
                    staffRole: decodedPayload.staffRole,
                }
            };
        } catch (error) {
            return null;
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: { name: string; email: string; phoneNumber?: string; password: string; role: string; companyName?: string; staffRole?: string; inviteToken?: string }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng ký không thành công');
            }

            return data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
            if (typeof window !== 'undefined') {
                localStorage.clear();
                // Clear any other session-related storage if needed
                sessionStorage.clear();
            }
        },
        setAuth: (state, action: PayloadAction<{ token: string; refreshToken: string; user: User }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
            localStorage.setItem('ticketbox_token', action.payload.token);
            localStorage.setItem('ticketbox_refresh_token', action.payload.refreshToken);
        },
        clearError: (state) => {
            state.error = null;
        },
        resetRegisterSuccess: (state) => {
            state.registerSuccess = false;
        }
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Rehydrate
        builder
            .addCase(rehydrateUser.fulfilled, (state, action) => {
                if (action.payload) {
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                }
            });

        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.registerSuccess = false;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
                state.registerSuccess = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.registerSuccess = false;
            });
    },
});

export const { logout, clearError, resetRegisterSuccess, setAuth } = authSlice.actions;
export default authSlice.reducer;
