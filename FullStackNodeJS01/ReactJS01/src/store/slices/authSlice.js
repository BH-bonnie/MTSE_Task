import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCurrentSession } from "../../util/api";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * Khởi động app: kiểm tra token trong localStorage và restore session
 */
export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem("access_token");
        if (!token) return rejectWithValue("no_token");

        try {
            const res = await getCurrentSession();
            if (res.data?.success && res.data?.user) {
                return res.data.user;
            }
            return rejectWithValue("invalid_session");
        } catch (err) {
            localStorage.removeItem("access_token");
            return rejectWithValue(err.response?.data?.message || "session_error");
        }
    }
);

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,   // true khi đang khởi động (restore session)
    error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        /**
         * Đăng nhập thành công → lưu token + user vào store
         * Gọi sau khi API /auth/login trả về access_token
         */
        loginSuccess(state, action) {
            const { token, user } = action.payload;
            localStorage.setItem("access_token", token);
            state.isAuthenticated = true;
            state.user = user;
            state.error = null;
        },

        /**
         * Đăng xuất → xóa token + reset store
         */
        logout(state) {
            localStorage.removeItem("access_token");
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
        },

        /**
         * Cập nhật thông tin user trong store (sau khi edit profile thành công)
         * @param {Object} action.payload - các field cần update
         */
        updateProfile(state, action) {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },

        /**
         * Xóa lỗi auth
         */
        clearError(state) {
            state.error = null;
        },
    },

    // ── Xử lý async thunk (fetchCurrentUser) ────────────────────────────────
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                // Không lưu error khi chỉ là "no token" (bình thường)
            });
    },
});

export const { loginSuccess, logout, updateProfile, clearError } = authSlice.actions;
export default authSlice.reducer;
