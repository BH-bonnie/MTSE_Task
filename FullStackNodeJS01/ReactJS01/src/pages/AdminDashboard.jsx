import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchAdminOrders } from "../store/slices/orderSlice";
import { getAllUsers } from "../util/api";
import { ShieldCheck, ShoppingBag, Users, ChevronRight, DollarSign, Activity } from "lucide-react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { orders } = useSelector((state) => state.orders);
    const [usersCount, setUsersCount] = useState(0);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        dispatch(fetchAdminOrders({}));
        
        const loadUsersCount = async () => {
            setLoadingUsers(true);
            try {
                const res = await getAllUsers();
                setUsersCount(res.data?.users?.length || 0);
            } catch (err) {
                console.error("Failed to load users for dashboard", err);
            } finally {
                setLoadingUsers(false);
            }
        };
        loadUsersCount();
    }, [dispatch]);

    // Compute basic stats
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders
        ?.filter(o => o.status === "delivered")
        ?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;

    const pendingOrders = orders?.filter(o => o.status === "new" || o.status === "cancel_requested")?.length || 0;

    return (
        <div className="max-w-6xl mx-auto py-8">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Kênh Quản Trị Hệ Thống</h1>
                        <p className="text-gray-500 mt-1">Chào mừng bạn trở lại, Admin. Hãy chọn tác vụ quản lý bên dưới.</p>
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Tổng Đơn Hàng</p>
                        <p className="text-2xl font-black text-gray-850 mt-1">{totalOrders}</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-650">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Doanh Thu (Đã Giao)</p>
                        <p className="text-2xl font-black text-gray-850 mt-1">{totalRevenue.toLocaleString()}đ</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Người Dùng</p>
                        <p className="text-2xl font-black text-gray-850 mt-1">{loadingUsers ? "..." : usersCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Cần Xử Lý</p>
                        <p className="text-2xl font-black text-amber-600 mt-1">{pendingOrders} đơn</p>
                    </div>
                </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Orders Panel card */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full group"
                >
                    <div className="p-8 flex-1">
                        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-100">
                            <ShoppingBag className="h-7 w-7" />
                        </div>
                        <h2 className="text-xl font-black text-gray-850 mb-3 group-hover:text-orange-500 transition-colors">Quản Lý Đơn Hàng</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Xem toàn bộ danh sách đơn đặt hàng của hệ thống. Kiểm duyệt các yêu cầu hủy đơn từ khách hàng và cập nhật tiến độ giao nhận từ Đơn mới, Đã xác nhận đến Đã giao thành công.
                        </p>
                    </div>
                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center group-hover:bg-orange-50/20 transition-colors">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Xem chi tiết</span>
                        <Link to="/admin/orders" className="p-2 bg-white border border-gray-100 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    </div>
                </motion.div>

                {/* Users Panel card */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full group"
                >
                    <div className="p-8 flex-1">
                        <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-gray-100">
                            <Users className="h-7 w-7" />
                        </div>
                        <h2 className="text-xl font-black text-gray-850 mb-3 group-hover:text-orange-500 transition-colors">Quản Lý Thành Viên</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Quản lý tất cả tài khoản người dùng đăng ký trên BonnieTea. Thực hiện các chức năng Admin như xem thông tin, thêm mới tài khoản, chỉnh sửa quyền hạn (User/Admin) hoặc khóa/mở khóa tài khoản.
                        </p>
                    </div>
                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center group-hover:bg-orange-50/20 transition-colors">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Xem chi tiết</span>
                        <Link to="/admin/users" className="p-2 bg-white border border-gray-100 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
