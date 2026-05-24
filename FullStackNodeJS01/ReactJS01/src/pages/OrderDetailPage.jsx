import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchOrderById, cancelOrder } from "../store/slices/orderSlice";
import { ArrowLeft, Clock, MapPin, Phone, User, CheckCircle, Package, Truck, Smile, AlertTriangle, AlertCircle, XCircle } from "lucide-react";
import { getStatusBadgeStyle, getStatusLabel } from "./OrderListPage";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
    { status: "new", label: "Đã đặt hàng", icon: Clock },
    { status: "confirmed", label: "Đã xác nhận", icon: CheckCircle },
    { status: "preparing", label: "Chuẩn bị hàng", icon: Package },
    { status: "shipping", label: "Đang giao", icon: Truck },
    { status: "delivered", label: "Đã giao", icon: Smile }
];

const OrderDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentOrder, loading, error } = useSelector((state) => state.orders);
    
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    useEffect(() => {
        dispatch(fetchOrderById(id));
    }, [dispatch, id]);

    // Check if cancellation is allowed
    const canCancel = currentOrder && (
        (currentOrder.status === "new" && ((new Date() - new Date(currentOrder.createdAt)) / 60000) < 30) ||
        currentOrder.status === "preparing"
    );

    const handleCancelSubmit = async (e) => {
        e.preventDefault();
        if (!cancelReason.trim()) {
            alert("Vui lòng nhập lý do hủy đơn!");
            return;
        }
        try {
            await dispatch(cancelOrder({ id: currentOrder._id, reason: cancelReason })).unwrap();
            alert(currentOrder.status === "preparing" ? "Đã gửi yêu cầu hủy đơn cho shop!" : "Đơn hàng đã được hủy thành công!");
            setCancelModalOpen(false);
            dispatch(fetchOrderById(id));
        } catch (err) {
            alert(err || "Không thể hủy đơn hàng");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
            </div>
        );
    }

    if (error || !currentOrder) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 max-w-md mx-auto shadow-sm">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-black text-gray-800 mb-2">Không tìm thấy đơn hàng</h3>
                <p className="text-gray-500 mb-6">{error || "Đơn hàng không tồn tại hoặc bạn không có quyền xem."}</p>
                <Link to="/orders" className="px-6 py-3 bg-orange-500 text-white font-black text-sm rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100">
                    Về danh sách đơn hàng
                </Link>
            </div>
        );
    }

    // Determine stepper progress
    const getActiveStepIndex = (status) => {
        if (status === "cancelled") return -1;
        return steps.findIndex(s => s.status === status);
    };
    const activeIndex = getActiveStepIndex(currentOrder.status);

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <Link to="/orders" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-orange-500 transition-colors mb-3">
                        <ArrowLeft className="h-4 w-4 mr-1.5" /> Lịch sử mua hàng
                    </Link>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-black text-gray-800 uppercase">ĐƠN HÀNG #{currentOrder._id.substring(currentOrder._id.length - 8)}</h1>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase ${getStatusBadgeStyle(currentOrder.status)}`}>
                            {getStatusLabel(currentOrder.status)}
                        </span>
                    </div>
                </div>
                {canCancel && (
                    <button
                        onClick={() => { setCancelReason(""); setCancelModalOpen(true); }}
                        className="px-5 py-3 border border-red-200 hover:border-red-500 text-red-500 hover:bg-red-50 font-black text-sm rounded-2xl transition-all cursor-pointer"
                    >
                        {currentOrder.status === "preparing" ? "Gửi Yêu Cầu Hủy Đơn" : "Hủy Đơn Hàng"}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left content: Tracking & Items */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Stepper tracking */}
                    {currentOrder.status !== "cancelled" ? (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                            <h2 className="text-lg font-black text-gray-800 mb-8">Trạng thái giao hàng</h2>
                            <div className="relative flex justify-between items-center w-full">
                                {/* Connector Line Background */}
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />
                                {/* Connector Line Progress */}
                                <div 
                                    className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 z-0 rounded-full transition-all duration-700" 
                                    style={{ width: `${activeIndex >= 0 ? (activeIndex / (steps.length - 1)) * 100 : 0}%` }}
                                />
                                
                                {steps.map((step, idx) => {
                                    const Icon = step.icon;
                                    const isCompleted = idx <= activeIndex;
                                    const isActive = idx === activeIndex;
                                    return (
                                        <div key={step.status} className="relative z-10 flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                                isActive 
                                                    ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200 scale-110" 
                                                    : isCompleted 
                                                        ? "bg-white border-orange-500 text-orange-500" 
                                                        : "bg-white border-gray-100 text-gray-400"
                                            }`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <span className={`text-[10px] md:text-xs font-black mt-3 text-center whitespace-nowrap transition-all ${
                                                isActive ? "text-orange-600 font-extrabold" : "text-gray-400"
                                            }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50/50 border border-red-200/50 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
                            <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
                            <div>
                                <h3 className="font-black text-red-950 text-base">Đơn Hàng Đã Bị Hủy</h3>
                                <p className="text-red-700 text-sm mt-1">Đơn hàng này đã được hủy. Tồn kho sản phẩm đã tự động được khôi phục.</p>
                                {currentOrder.statusHistory?.find(h => h.status === "cancelled")?.note && (
                                    <div className="mt-3 p-3 bg-red-100/50 border border-red-200/30 rounded-xl">
                                        <p className="text-xs font-bold text-red-800">Lý do hủy đơn:</p>
                                        <p className="text-sm text-red-950 mt-0.5 italic">"{currentOrder.statusHistory.find(h => h.status === "cancelled").note}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Order details timeline */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-lg font-black text-gray-800 mb-6">Lịch sử hoạt động</h2>
                        <div className="relative border-l border-gray-100 ml-4 pl-6 space-y-6">
                            {currentOrder.statusHistory && [...currentOrder.statusHistory].reverse().map((history, idx) => (
                                <div key={idx} className="relative">
                                    {/* timeline bullet */}
                                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                    </div>
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{getStatusLabel(history.status)}</p>
                                            {history.note && (
                                                <p className="text-xs text-gray-500 mt-1">{history.note}</p>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                            {new Date(history.updatedAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order breakdown */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
                        <h2 className="text-lg font-black text-gray-800 mb-6 pb-4 border-b border-gray-100">Chi tiết sản phẩm</h2>
                        <div className="divide-y divide-gray-100">
                            {currentOrder.items.map((item) => {
                                if (!item.product) return null;
                                return (
                                    <div key={item.product._id} className="py-4 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                <img src={item.product.images?.[0]} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <Link to={`/product/${item.product._id}`} className="font-black text-gray-800 hover:text-orange-500 transition-colors text-sm line-clamp-1">
                                                    {item.product.name}
                                                </Link>
                                                <p className="text-xs text-gray-400 mt-1 font-medium">
                                                    {item.quantity} x {item.price.toLocaleString()}đ
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-black text-sm text-gray-800">{(item.quantity * item.price).toLocaleString()}đ</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right content: Shipping & Payment Summary */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Shipping info */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-1.5">
                            <MapPin className="h-5 w-5 text-orange-500" /> Địa chỉ giao hàng
                        </h2>
                        <div className="space-y-4 text-sm font-bold text-gray-700">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Người nhận</p>
                                    <p className="text-gray-800 mt-0.5">{currentOrder.shippingAddress?.fullName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Số điện thoại</p>
                                    <p className="text-gray-800 mt-0.5">{currentOrder.shippingAddress?.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Địa chỉ chi tiết</p>
                                    <p className="text-gray-850 leading-relaxed mt-0.5">{currentOrder.shippingAddress?.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-lg font-black text-gray-800 mb-6">Tóm tắt thanh toán</h2>
                        <div className="space-y-4 pb-4 border-b border-gray-100 text-sm font-medium text-gray-500">
                            <div className="flex justify-between">
                                <span>Phương thức</span>
                                <span className="font-black text-orange-600">COD (Tiền mặt)</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phí vận chuyển</span>
                                <span className="text-green-500 font-bold">Miễn phí</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end pt-4">
                            <span className="font-black text-gray-800">Tổng cộng</span>
                            <span className="font-black text-orange-600 text-xl">{currentOrder.totalAmount?.toLocaleString()}đ</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            <AnimatePresence>
                {cancelModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-100 shadow-2xl"
                        >
                            <h3 className="text-lg font-black text-gray-800 mb-2">
                                {currentOrder.status === "preparing" ? "Gửi Yêu Cầu Hủy Đơn" : "Xác Nhận Hủy Đơn Hàng"}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {currentOrder.status === "preparing"
                                    ? "Đơn hàng đang chuẩn bị. Bạn cần cung cấp lý do hủy để gửi yêu cầu cho shop duyệt."
                                    : "Đơn hàng này đang ở trạng thái mới. Bạn có chắc chắn muốn hủy đơn hàng không?"}
                            </p>

                            <form onSubmit={handleCancelSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Lý do hủy đơn
                                    </label>
                                    <textarea
                                        required
                                        rows="3"
                                        placeholder="Nhập lý do chi tiết..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-800 resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setCancelModalOpen(false)}
                                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-black rounded-xl transition-all cursor-pointer"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-black rounded-xl shadow-lg shadow-red-100 transition-all cursor-pointer"
                                    >
                                        Gửi yêu cầu
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

export default OrderDetailPage;
