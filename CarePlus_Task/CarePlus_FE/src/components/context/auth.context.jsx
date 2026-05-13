/**
 * auth.context.jsx
 *
 * Compatibility layer — cung cấp hook `useAuth()` lấy data từ Redux store.
 * Mọi state auth đều được quản lý bởi Redux (store/slices/authSlice.js).
 *
 * Cách dùng trong component:
 *   const { user, isAuthenticated, loading } = useAuth();
 *   const dispatch = useDispatch();
 *   dispatch(logout());
 *   dispatch(updateProfile({ firstName: "Bình" }));
 */
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess, logout, updateProfile } from "../../store/slices/authSlice";

/**
 * useAuth — hook tiện ích đọc auth state từ Redux
 * Tương thích với API của Context cũ để không cần đổi nhiều code ở components
 */
export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

    return {
        user,
        isAuthenticated,
        loading,
        error,
        // Helper actions
        login: (token, user) => dispatch(loginSuccess({ token, user })),
        logout: () => dispatch(logout()),
        updateUser: (fields) => dispatch(updateProfile(fields)),
    };
};

export { loginSuccess, logout, updateProfile };
export default useAuth;
