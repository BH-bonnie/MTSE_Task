import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "./store/slices/authSlice";
import Header from "./components/layout/header";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import ForgotPasswordPage from "./pages/forgotPassword";
import AdminUsersPage from "./pages/adminUsers";
import UserProfilePage from "./pages/user";

const getProfileRouteByRole = (role) => {
    return role === "admin" ? "/admin/profile" : "/user/profile";
};

const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

    if (loading) {
        return (
            <div className="app-loading">
                <div className="app-loading__spinner" />
                <span>Đang tải...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles?.length && !roles.includes(user?.role)) {
        return <Navigate to={getProfileRouteByRole(user?.role)} replace />;
    }

    return children;
};

const PublicOnlyRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

    if (loading) {
        return (
            <div className="app-loading">
                <div className="app-loading__spinner" />
                <span>Đang tải...</span>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={getProfileRouteByRole(user?.role)} replace />;
    }

    return children;
};

const AppRoutes = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    return (
        <div className="app-wrapper">
            <Header />
            <main className="app-content">
                <Routes>
                    {/* Trang chủ tạm thời */}
                    <Route
                        path="/"
                        element={
                            <div className="placeholder-page">
                                <h1>Chào mừng đến CarePlus</h1>
                                <p>Ứng dụng quản lý sức khỏe của bạn</p>
                            </div>
                        }
                    />

                    {/* Trang Login tạm thời */}
                    <Route
                        path="/login"
                        element={
                            <PublicOnlyRoute>
                                <LoginPage />
                            </PublicOnlyRoute>
                        }
                    />

                    <Route
                        path="/register"
                        element={
                            <PublicOnlyRoute>
                                <RegisterPage />
                            </PublicOnlyRoute>
                        }
                    />

                    <Route
                        path="/forgot-password"
                        element={
                            <PublicOnlyRoute>
                                <ForgotPasswordPage />
                            </PublicOnlyRoute>
                        }
                    />

                    <Route
                        path="/user/profile"
                        element={
                            <ProtectedRoute roles={["user"]}>
                                <UserProfilePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/profile"
                        element={
                            <ProtectedRoute roles={["admin"]}>
                                <UserProfilePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute roles={["admin"]}>
                                <AdminUsersPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;
