import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { UserOutlined, LogoutOutlined, LoginOutlined, UserAddOutlined } from "@ant-design/icons";

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    const getDisplayName = () => {
        if (!user) return "";
        const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
        return full || user.username || "";
    };

    const getProfileRoute = () => {
        return user?.role === "admin" ? "/admin/profile" : "/user/profile";
    };

    return (
        <header className="app-header">
            <div className="app-header__inner">
                {/* Logo */}
                <Link to="/" className="app-header__logo">
                    <span className="logo-care">Care</span>
                    <span className="logo-plus">Plus</span>
                </Link>

                {/* Nav */}
                <nav className="app-header__nav">
                    <Link to="/" className="nav-link">Trang chủ</Link>
                    {isAuthenticated && (
                        <Link to={getProfileRoute()} className="nav-link">Hồ sơ</Link>
                    )}
                    {isAuthenticated && user?.role === "admin" && (
                        <Link to="/admin/users" className="nav-link">Người dùng</Link>
                    )}
                </nav>

                {/* Auth actions */}
                <div className="app-header__actions">
                    {isAuthenticated ? (
                        <>
                            <Link to={getProfileRoute()} className="header-user" id="header-user-profile">
                                <span className="header-user__avatar">
                                    {user?.avatar
                                        ? <img src={user.avatar} alt="avatar" />
                                        : <UserOutlined />
                                    }
                                </span>
                                <span className="header-user__name">{getDisplayName()}</span>
                            </Link>
                            <button
                                id="btn-logout"
                                className="btn btn--ghost btn--sm"
                                onClick={handleLogout}
                            >
                                <LogoutOutlined /> Đăng xuất
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="btn btn--outline btn--sm">
                                <UserAddOutlined /> Đăng ký
                            </Link>
                            <Link to="/login" id="btn-login-nav" className="btn btn--primary btn--sm">
                                <LoginOutlined /> Đăng nhập
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
