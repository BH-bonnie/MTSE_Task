import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAdminOrders, updateOrderStatus } from "../store/slices/orderSlice";
import { getStatusBadgeStyle, getStatusLabel } from "./OrderListPage";
import { Search, Eye, Filter, Calendar, User, ShoppingBag, Edit3, ClipboardList, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusTabs = [
    { label: "Tất cả", value: "" },
    { label: "Đơn mới", value: "new" },
    { label: "Đã xác nhận", value: "confirmed" },
    { label: "Đang chuẩn bị", value: "preparing" },
    { label: "Đang giao", value: "shipping" },
    { label: "Đã giao", value: "delivered" },
    { label: "Đã hủy", value: "cancelled" }
];

const AdminOrderPage = () => {
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((state) => state.orders);
    const [activeTab, setActiveTab] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    
    // Status update modal state
    const [updateModalData, setUpdateModalData] = useState(null); // { id, currentStatus }
    const [newStatus, setNewStatus] = useState("");
    const [statusNote, setStatusNote] = useState("");

    useEffect(() => {
        dispatch(fetchAdminOrders({ status: activeTab }));
    }, [dispatch, activeTab]);

    const handleOpenUpdateModal = (order) => {
        setUpdateModalData(order);
        setNewStatus(order.status);
        setStatusNote("");
    };

    const handleUpdateStatusSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateOrderStatus({
                id: updateModalData._id,
                status: newStatus,
                note: statusNote
            })).unwrap();
            alert("Cập nhật trạng thái đơn hàng thành công!");
            setUpdateModalData(null);
            dispatch(fetchAdminOrders({ status: activeTab }));
        } catch (err) {
            alert(err || "Lỗi cập nhật trạng thái");
        }
    };

    // Filter/Search orders locally (fallback/extra refinement)
    const filteredOrders = orders.filter(order => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            order._id.toLowerCase().includes(query) ||
            order.shippingAddress?.fullName?.toLowerCase().includes(query) ||
            order.shippingAddress?.phone?.includes(query)
        );
    });

    // Helper to check if order has a pending cancellation request
    const getCancelRequest = (order) => {
        if (order.status !== "preparing") return null;
        const lastHistory = order.statusHistory?.[order.statusHistory.length - 1];
        if (lastHistory && lastHistory.note && lastHistory.note.includes("Yêu cầu hủy đơn từ khách hàng")) {
            return lastHistory.note;
        }
        return null;
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        <ClipboardList className="h-8 w-8 text-orange-500" /> Quản Lý Đơn Hàng
                    </h1>
                    <p className="text-gray-500 mt-1">Giao diện quản trị viên dùng để kiểm duyệt và cập nhật trạng thái đơn hàng toàn hệ thống.</p>
                </div>
            </div>

            {/* Toolbar: Search & Tab filters */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-8">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm theo Mã đơn, Tên, SĐT khách hàng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-850 shadow-sm"
                    />
                    <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                </div>

                {/* Status Tabs */}
                <div className="flex border-b border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-hide gap-6">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.label}
                            onClick={() => setActiveTab(tab.value)}
                            className={`pb-4 text-sm font-black transition-all border-b-2 uppercase tracking-wider cursor-pointer ${
                                activeTab === tab.value
                                    ? "border-orange-500 text-orange-600 font-extrabold"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-400 mb-4">
                        <ShoppingBag className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-black text-gray-800 mb-1">Không có đơn hàng nào khớp</h3>
                    <p className="text-gray-500 text-sm">Hệ thống hiện không ghi nhận đơn hàng nào ở bộ lọc này.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map((order) => {
                        const cancelRequestMsg = getCancelRequest(order);
                        return (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white rounded-3xl border shadow-sm overflow-hidden p-6 transition-all ${
                                    cancelRequestMsg ? "border-amber-300 ring-2 ring-amber-100 bg-amber-50/10" : "border-gray-100"
                                }`}
                            >
                                {/* Cancellation request banner */}
                                {cancelRequestMsg && (
                                    <div className="mb-4 -mx-6 -mt-6 p-4 bg-amber-500/10 border-b border-amber-300 text-amber-900 flex items-start gap-2.5">
                                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-black text-amber-950">YÊU CẦU HỦY ĐƠN HÀNG TỪ KHÁCH HÀNG</p>
                                            <p className="text-xs text-amber-800 mt-0.5 italic">"{cancelRequestMsg}"</p>
                                        </div>
                                    </div>
                                )}

                                {/* Card Header */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-gray-100 gap-2">
                                    <div className="flex items-center flex-wrap gap-2.5">
                                        <span className="text-xs font-bold text-gray-400">MÃ ĐƠN:</span>
                                        <span className="text-sm font-black text-gray-800 uppercase">#{order._id.substring(order._id.length - 8)}</span>
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase ${getStatusBadgeStyle(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-400 font-medium gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(order.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                {/* Body columns */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-4">
                                    {/* Column 1: Client Info */}
                                    <div className="md:col-span-4 space-y-3">
                                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5 text-gray-450" /> Khách hàng nhận
                                        </div>
                                        <div className="text-sm font-bold text-gray-700 space-y-1">
                                            <p className="text-gray-900 font-black">{order.shippingAddress?.fullName}</p>
                                            <p className="text-gray-500 font-medium">SĐT: {order.shippingAddress?.phone}</p>
                                            <p className="text-gray-500 font-medium text-xs leading-relaxed">{order.shippingAddress?.address}</p>
                                        </div>
                                    </div>

                                    {/* Column 2: Order items summary */}
                                    <div className="md:col-span-8 space-y-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                            Chi tiết sản phẩm ({order.items?.length || 0})
                                        </div>
                                        <div className="space-y-2">
                                            {order.items?.map((item) => {
                                                if (!item.product) return null;
                                                return (
                                                    <div key={item.product._id} className="flex justify-between items-center text-sm gap-2">
                                                        <span className="font-bold text-gray-800 flex-1 line-clamp-1">
                                                            {item.product.name}
                                                            <span className="text-gray-400 font-medium ml-2">x{item.quantity}</span>
                                                        </span>
                                                        <span className="font-bold text-gray-500 text-xs">{(item.price * item.quantity).toLocaleString()}đ</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer actions */}
                                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-4 border-t border-gray-100 gap-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs text-gray-400 font-bold uppercase">Tổng thu:</span>
                                        <span className="text-xl font-black text-orange-600">{order.totalAmount.toLocaleString()}đ</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleOpenUpdateModal(order)}
                                            className="px-4 py-2 border-2 border-orange-500/20 hover:border-orange-500 text-orange-600 hover:bg-orange-50/50 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                                        >
                                            <Edit3 className="h-3.5 w-3.5" /> Cập nhật trạng thái
                                        </button>
                                        <Link
                                            to={`/orders/${order._id}`}
                                            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-black rounded-xl flex items-center gap-1 transition-all"
                                        >
                                            <Eye className="h-3.5 w-3.5" /> Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Update Status Modal */}
            <AnimatePresence>
                {updateModalData && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-100 shadow-2xl"
                        >
                            <h3 className="text-lg font-black text-gray-850 mb-2 flex items-center gap-2">
                                Cập Nhật Trạng Thái Đơn Hàng
                            </h3>
                            <p className="text-xs text-gray-400 mb-6">MÃ ĐƠN: #{updateModalData._id}</p>

                            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Trạng thái mới
                                    </label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-800"
                                    >
                                        <option value="new">Đơn hàng mới</option>
                                        <option value="confirmed">Đã xác nhận</option>
                                        <option value="preparing">Shop đang chuẩn bị hàng</option>
                                        <option value="shipping">Đang giao hàng</option>
                                        <option value="delivered">Đã giao thành công</option>
                                        <option value="cancelled">Hủy đơn hàng</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Ghi chú / Lý do (Tùy chọn)
                                    </label>
                                    <textarea
                                        rows="2"
                                        placeholder="Vd: Shipper bắt đầu đi giao hàng, Hủy do hết tồn kho..."
                                        value={statusNote}
                                        onChange={(e) => setStatusNote(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-800 resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setUpdateModalData(null)}
                                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-black rounded-xl transition-all cursor-pointer"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-black rounded-xl shadow-lg shadow-orange-100 transition-all cursor-pointer"
                                    >
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminOrderPage;
