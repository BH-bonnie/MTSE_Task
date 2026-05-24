import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchOrders, cancelOrder } from "../store/slices/orderSlice";
import { ShoppingBag, Eye, Calendar, DollarSign, Tag, Clock } from "lucide-react";
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

export const getStatusBadgeStyle = (status) => {
    switch (status) {
        case "new":
            return "bg-blue-50 text-blue-600 border-blue-100";
        case "confirmed":
            return "bg-indigo-50 text-indigo-600 border-indigo-100";
        case "preparing":
            return "bg-amber-50 text-amber-600 border-amber-100";
        case "shipping":
            return "bg-purple-50 text-purple-600 border-purple-100";
        case "delivered":
            return "bg-green-50 text-green-600 border-green-100";
        case "cancelled":
            return "bg-red-50 text-red-600 border-red-100";
        default:
            return "bg-gray-50 text-gray-600 border-gray-100";
    }
};

export const getStatusLabel = (status) => {
    switch (status) {
        case "new": return "Đơn hàng mới";
        case "confirmed": return "Đã xác nhận";
        case "preparing": return "Đang chuẩn bị";
        case "shipping": return "Đang giao hàng";
        case "delivered": return "Đã giao thành công";
        case "cancelled": return "Đã hủy đơn";
        default: return status;
    }
};

const OrderListPage = () => {
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((state) => state.orders);
    const [activeTab, setActiveTab] = useState("");
    const [cancelModalData, setCancelModalData] = useState(null); // { id, isRequest }
    const [cancelReason, setCancelReason] = useState("");

    useEffect(() => {
        dispatch(fetchOrders({ status: activeTab }));
    }, [dispatch, activeTab]);

    const handleOpenCancelModal = (orderId, status) => {
        const isRequest = status === "preparing";
        setCancelModalData({ id: orderId, isRequest });
        setCancelReason("");
    };

    const handleCancelOrderSubmit = async (e) => {
        e.preventDefault();
        if (!cancelReason.trim()) {
            alert("Vui lòng nhập lý do hủy đơn!");
            return;
        }
        try {
            await dispatch(cancelOrder({ id: cancelModalData.id, reason: cancelReason })).unwrap();
            alert(cancelModalData.isRequest ? "Đã gửi yêu cầu hủy đơn cho shop!" : "Đơn hàng đã được hủy thành công!");
            setCancelModalData(null);
            dispatch(fetchOrders({ status: activeTab }));
        } catch (err) {
            alert(err || "Không thể hủy đơn hàng");
        }
    };

    // Helper check to display "Hủy đơn" action button on list
    const canCancel = (order) => {
        if (order.status === "new") {
            // Check if within 30 mins
            const diffMin = (new Date() - new Date(order.createdAt)) / 60000;
            return diffMin < 30;
        }
        if (order.status === "preparing") {
            return true; // Send request
        }
        return false;
    };

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Lịch Sử Mua Hàng</h1>
                    <p className="text-gray-500 mt-1">Theo dõi hành trình và trạng thái các đơn hàng của bạn</p>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex border-b border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-hide gap-8 mb-8">
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

            {/* Content list */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[30vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-400 mb-4">
                        <ShoppingBag className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-black text-gray-800 mb-1">Không tìm thấy đơn hàng nào</h3>
                    <p className="text-gray-500 text-sm mb-6">Bạn chưa đặt đơn hàng nào ở trạng thái này.</p>
                    <Link to="/search" className="px-6 py-3 bg-orange-500 text-white text-sm font-black rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100">
                        Đặt hàng ngay
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden p-6"
                        >
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-gray-100 gap-2">
                                <div className="flex items-center gap-3">
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

                            {/* Card Items */}
                            <div className="divide-y divide-gray-50">
                                {order.items.map((item) => {
                                    if (!item.product) return null;
                                    return (
                                        <div key={item.product._id} className="py-3 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                    <img src={item.product.images?.[0]} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm line-clamp-1">{item.product.name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {item.quantity} x {item.price.toLocaleString()}đ
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-sm text-gray-800">{(item.quantity * item.price).toLocaleString()}đ</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Card Footer */}
                            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-4 mt-4 border-t border-gray-100 gap-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xs text-gray-400 font-bold uppercase">Tổng thanh toán:</span>
                                    <span className="text-xl font-black text-orange-600">{order.totalAmount.toLocaleString()}đ</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {canCancel(order) && (
                                        <button
                                            onClick={() => handleOpenCancelModal(order._id, order.status)}
                                            className="px-4 py-2 border border-red-200 hover:border-red-500 text-red-500 hover:bg-red-50 text-xs font-black rounded-xl transition-all cursor-pointer"
                                        >
                                            {order.status === "preparing" ? "Gửi Yêu cầu hủy" : "Hủy đơn hàng"}
                                        </button>
                                    )}
                                    <Link
                                        to={`/orders/${order._id}`}
                                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-100 flex items-center gap-1 transition-all"
                                    >
                                        <Eye className="h-3.5 w-3.5" /> Chi tiết
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Cancel Modal */}
            <AnimatePresence>
                {cancelModalData && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-100 shadow-2xl"
                        >
                            <h3 className="text-lg font-black text-gray-800 mb-2">
                                {cancelModalData.isRequest ? "Gửi Yêu Cầu Hủy Đơn" : "Xác Nhận Hủy Đơn Hàng"}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {cancelModalData.isRequest
                                    ? "Đơn hàng đang trong quá trình chuẩn bị. Bạn cần nhập lý do hủy để gửi yêu cầu chờ shop duyệt."
                                    : "Bạn có chắc chắn muốn hủy đơn hàng này? Thao tác này sẽ hoàn lại tồn kho sản phẩm."}
                            </p>

                            <form onSubmit={handleCancelOrderSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Lý do hủy đơn hàng
                                    </label>
                                    <textarea
                                        required
                                        rows="3"
                                        placeholder="Vd: Tôi muốn đổi sản phẩm khác, Nhập sai địa chỉ..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-800 resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setCancelModalData(null)}
                                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-black rounded-xl transition-all cursor-pointer"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-black rounded-xl shadow-lg shadow-red-100 transition-all cursor-pointer"
                                    >
                                        Xác nhận
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

export default OrderListPage;
