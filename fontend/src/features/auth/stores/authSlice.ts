import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Async thunk cho đăng nhập
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

            // Decode JWT payload (phần thứ 2, base64)
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));

            return {
                token,
                user: {
                    id: decodedPayload.sub,
                    email: decodedPayload.email,
                    name: decodedPayload.name || credentials.email.split('@')[0],
                    role: decodedPayload.role,
                }
            };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


// Async thunk cho đăng ký
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: { name: string; email: string; phoneNumber?: string; password: string; role: string }, { rejectWithValue }) => {
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
            localStorage.removeItem('ticketbox_token');
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
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
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

export const { logout, clearError, resetRegisterSuccess } = authSlice.actions;
export default authSlice.reducer;
