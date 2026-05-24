import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "./store/slices/authSlice";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import ForgotPasswordPage from "./pages/forgotPassword";
import AdminUsersPage from "./pages/adminUsers";
import UserProfilePage from "./pages/user";
import CartPage from "./pages/CartPage";
import OrderListPage from "./pages/OrderListPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AdminOrderPage from "./pages/AdminOrderPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProductPage from "./pages/AdminProductPage";
import AdminStatsPage from "./pages/AdminStatsPage";
import AdminLayout from "./components/layout/AdminLayout";
import { fetchCart } from "./store/slices/cartSlice";

const getProfileRouteByRole = (role) => {
    return role === "admin" ? "/admin" : "/profile";
};

const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

    if (loading) {
        return (
            <div className="app-loading flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
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
            <div className="app-loading flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
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
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    const isAdmin = isAuthenticated && user?.role === "admin";

    if (isAdmin) {
        return (
            <AdminLayout>
                <Routes>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/orders" element={<AdminOrderPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/products" element={<AdminProductPage />} />
                    <Route path="/admin/stats" element={<AdminStatsPage />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            </AdminLayout>
        );
    }

    return (
        <div className="app-wrapper min-h-screen bg-[#fafafa]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 md:py-16">

                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/search" element={<SearchPage />} />

                    {/* Auth Routes */}
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
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <UserProfilePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute>
                                <CartPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <OrderListPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/orders/:id"
                        element={
                            <ProtectedRoute>
                                <OrderDetailPage />
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
