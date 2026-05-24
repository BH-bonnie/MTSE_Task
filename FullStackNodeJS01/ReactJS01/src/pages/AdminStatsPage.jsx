import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAdminOrders } from "../store/slices/orderSlice";
import { getAllUsers } from "../util/api";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Percent, AlertCircle } from "lucide-react";

const AdminStatsPage = () => {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector((state) => state.orders);
    const [usersCount, setUsersCount] = useState(0);

    useEffect(() => {
        dispatch(fetchAdminOrders({}));
        const loadUsers = async () => {
            try {
                const res = await getAllUsers();
                setUsersCount(res.data?.users?.length || 0);
            } catch (err) {
                console.error(err);
            }
        };
        loadUsers();
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
            </div>
        );
    }

    // Analytics calculations
    const totalOrders = orders?.length || 0;
    const completedOrders = orders?.filter(o => o.status === "delivered") || [];
    const cancelledOrders = orders?.filter(o => o.status === "cancelled") || [];
    const pendingOrders = orders?.filter(o => o.status === "new" || o.status === "confirmed" || o.status === "preparing" || o.status === "shipping") || [];

    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const cancelRate = totalOrders > 0 ? (cancelledOrders.length / totalOrders) * 100 : 0;
    const successRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;

    // Status counts
    const statusCounts = {
        new: orders?.filter(o => o.status === "new").length || 0,
        confirmed: orders?.filter(o => o.status === "confirmed").length || 0,
        preparing: orders?.filter(o => o.status === "preparing").length || 0,
        shipping: orders?.filter(o => o.status === "shipping").length || 0,
        delivered: completedOrders.length,
        cancelled: cancelledOrders.length
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                    <BarChart3 className="h-8 w-8 text-orange-500" /> Báo Cáo & Thống Kê
                </h1>
                <p className="text-gray-505 mt-1">Báo cáo doanh thu, tình trạng đơn hàng và tăng trưởng hệ thống BonnieTea.</p>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Metric 1 */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-black uppercase">DOANH THU</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-850">{totalRevenue.toLocaleString()}đ</h3>
                    <p className="text-xs text-gray-450 mt-1 font-bold">Tổng doanh thu thực tế nhận (Đã Giao)</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-650">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-black uppercase">ĐƠN HÀNG</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-850">{totalOrders} đơn</h3>
                    <p className="text-xs text-gray-450 mt-1 font-bold">
                        {completedOrders.length} thành công | {pendingOrders.length} đang chờ xử lý
                    </p>
                </div>

                {/* Metric 3 */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                            <Percent className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase">HIỆU SUẤT ĐƠN</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-850">{successRate.toFixed(1)}%</h3>
                    <p className="text-xs text-gray-450 mt-1 font-bold">Tỷ lệ hủy đơn hàng: {cancelRate.toFixed(1)}%</p>
                </div>
            </div>

            {/* Visual breakdown block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Status distribution bars */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-1.5">
                        <TrendingUp className="h-5 w-5 text-orange-500" /> Tình trạng phân bổ đơn hàng
                    </h3>
                    
                    <div className="space-y-5">
                        {[
                            { label: "Đơn hàng mới", count: statusCounts.new, color: "bg-blue-500" },
                            { label: "Đã xác nhận", count: statusCounts.confirmed, color: "bg-purple-500" },
                            { label: "Đang chuẩn bị hàng", count: statusCounts.preparing, color: "bg-amber-500" },
                            { label: "Đang giao hàng", count: statusCounts.shipping, color: "bg-cyan-500" },
                            { label: "Giao thành công", count: statusCounts.delivered, color: "bg-green-500" },
                            { label: "Đơn hàng đã hủy", count: statusCounts.cancelled, color: "bg-red-500" }
                        ].map((item, idx) => {
                            const pct = totalOrders > 0 ? (item.count / totalOrders) * 100 : 0;
                            return (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-gray-700">{item.label}</span>
                                        <span className="text-gray-500">{item.count} đơn ({pct.toFixed(0)}%)</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-55 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* System summaries list */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-black text-gray-800 mb-6">Tóm tắt hệ thống</h3>
                        <div className="divide-y divide-gray-100 text-sm font-bold text-gray-700">
                            <div className="py-3.5 flex justify-between">
                                <span className="text-gray-500">Tổng tài khoản thành viên</span>
                                <span className="text-gray-900">{usersCount}</span>
                            </div>
                            <div className="py-3.5 flex justify-between">
                                <span className="text-gray-500">Đơn hàng cần xử lý gấp</span>
                                <span className="text-amber-600">
                                    {orders?.filter(o => o.status === "new" || o.status === "cancel_requested").length || 0}
                                </span>
                            </div>
                            <div className="py-3.5 flex justify-between">
                                <span className="text-gray-500">Giá trị đơn hàng trung bình</span>
                                <span className="text-gray-900">
                                    {totalOrders > 0 ? `${Math.round(orders.reduce((sum, o) => sum + o.totalAmount, 0) / totalOrders).toLocaleString()}đ` : "0đ"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-orange-850 leading-relaxed font-bold">
                            Hệ thống tự động thực hiện tính toán báo cáo từ lịch sử trạng thái đơn hàng theo thời gian thực.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminStatsPage;
