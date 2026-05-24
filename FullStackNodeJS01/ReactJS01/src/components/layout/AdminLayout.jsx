import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { LayoutDashboard, ShoppingBag, Users, Coffee, BarChart3, LogOut, ShieldCheck, User } from "lucide-react";

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    const sidebarItems = [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { name: "Quản lý đơn", path: "/admin/orders", icon: ShoppingBag },
        { name: "Quản lý user", path: "/admin/users", icon: Users },
        { name: "Quản lý sản phẩm", path: "/admin/products", icon: Coffee },
        { name: "Thống kê", path: "/admin/stats", icon: BarChart3 }
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col flex-shrink-0 border-r border-gray-800">
                {/* Logo Section */}
                <div className="h-20 flex items-center px-6 gap-3 border-b border-gray-800/60 bg-gray-950/40">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-black text-white tracking-tight">Admin Console</span>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">BonnieTea System</p>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-black tracking-wide transition-all ${
                                    isActive
                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/10"
                                        : "hover:bg-gray-800/50 hover:text-white"
                                }`}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar footer user info */}
                <div className="p-4 border-t border-gray-800/60 bg-gray-950/20 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
                            <User className="h-5 w-5 text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-white truncate leading-none">{user?.name || "Admin"}</p>
                            <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-1 inline-block">SYSTEM ADMIN</span>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-xl text-xs font-black transition-all cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Content pane */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top header */}
                <header className="h-20 bg-white border-b border-gray-150 flex items-center justify-between px-8 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Hệ thống</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-500">Đang trực tuyến</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Profile action */}
                        <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-150/50">
                            <div className="w-6.5 h-6.5 bg-orange-100 rounded-full flex items-center justify-center">
                                <User className="h-3.5 w-3.5 text-orange-600" />
                            </div>
                            <span className="text-xs font-black text-gray-700">{user?.name || "Admin"}</span>
                        </div>
                    </div>
                </header>

                {/* Main pane scroll container */}
                <main className="flex-1 overflow-y-auto px-8 py-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
