import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, MapPin, Phone, User, ShieldCheck, HelpCircle } from "lucide-react";
import { fetchCart, updateCartItem, removeFromCart, clearCart } from "../store/slices/cartSlice";
import { checkout } from "../store/slices/orderSlice";
import { motion } from "framer-motion";

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, totalAmount, totalItems, loading: cartLoading } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const { loading: checkoutLoading } = useSelector((state) => state.orders);

    const [shippingAddress, setShippingAddress] = useState({
        fullName: "",
        phone: "",
        address: ""
    });

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            setShippingAddress({
                fullName: user.name || "",
                phone: user.phone || "",
                address: user.address || ""
            });
        }
    }, [user]);

    const handleQuantityChange = (productId, currentQty, amount, stock) => {
        const newQty = currentQty + amount;
        if (newQty < 1) {
            if (window.confirm("Bạn có muốn xóa sản phẩm này khỏi giỏ hàng không?")) {
                dispatch(removeFromCart(productId));
            }
            return;
        }
        if (stock !== undefined && newQty > stock) {
            alert(`Sản phẩm này chỉ còn ${stock} sản phẩm trong kho!`);
            return;
        }
        dispatch(updateCartItem({ productId, quantity: newQty }));
    };

    const handleRemoveItem = (productId) => {
        if (window.confirm("Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?")) {
            dispatch(removeFromCart(productId));
        }
    };

    const handleClearCart = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?")) {
            dispatch(clearCart());
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!shippingAddress.fullName.trim() || !shippingAddress.phone.trim() || !shippingAddress.address.trim()) {
            alert("Vui lòng nhập đầy đủ thông tin nhận hàng!");
            return;
        }
        
        // Basic phone validation
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(shippingAddress.phone.trim())) {
            alert("Số điện thoại không hợp lệ (yêu cầu từ 10-11 chữ số)!");
            return;
        }

        try {
            const order = await dispatch(checkout(shippingAddress)).unwrap();
            alert("Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.");
            navigate(`/orders/${order._id}`);
        } catch (error) {
            alert(error || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
        }
    };

    if (cartLoading && items.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto"
            >
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-6">
                    <ShoppingBag className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Giỏ hàng của bạn đang trống</h2>
                <p className="text-gray-500 mb-8">Hãy chọn những ly trà sữa thơm ngon của BonnieTea để lấp đầy chiếc giỏ này nhé!</p>
                <Link 
                    to="/search" 
                    className="px-8 py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
                >
                    Khám phá menu ngay
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8">
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight mb-8">
                Giỏ Hàng Của Bạn <span className="text-orange-500">({totalItems})</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Cart Items List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                            <span className="font-bold text-gray-800">Sản phẩm trong giỏ</span>
                            <button 
                                onClick={handleClearCart}
                                className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4" /> Xóa tất cả
                            </button>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {items.map((item) => {
                                const product = item.product;
                                if (!product) return null;
                                const isPromo = product.promotionPrice > 0;
                                const itemPrice = isPromo ? product.promotionPrice : product.price;
                                const hasStockError = product.stock < item.quantity;

                                return (
                                    <div key={product._id} className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                <img 
                                                    src={product.images?.[0] || "https://via.placeholder.com/150"} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <Link to={`/product/${product._id}`} className="font-black text-gray-800 hover:text-orange-500 transition-colors text-base line-clamp-1">
                                                    {product.name}
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-orange-600 font-black">{itemPrice.toLocaleString()}đ</span>
                                                    {isPromo && (
                                                        <span className="text-gray-300 line-through text-xs font-bold">{product.price.toLocaleString()}đ</span>
                                                    )}
                                                </div>
                                                <div className="mt-1 text-xs">
                                                    {product.stock <= 0 ? (
                                                        <span className="text-red-500 font-bold">Hết hàng</span>
                                                    ) : hasStockError ? (
                                                        <span className="text-amber-500 font-bold">Vượt quá tồn kho (Kho còn {product.stock})</span>
                                                    ) : (
                                                        <span className="text-green-500 font-bold">Còn hàng</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6">
                                            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
                                                <button 
                                                    onClick={() => handleQuantityChange(product._id, item.quantity, -1, product.stock)}
                                                    className="p-2 hover:bg-white rounded-lg transition-all shadow-sm cursor-pointer"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-10 text-center font-bold text-gray-800">{item.quantity}</span>
                                                <button 
                                                    onClick={() => handleQuantityChange(product._id, item.quantity, 1, product.stock)}
                                                    className="p-2 hover:bg-white rounded-lg transition-all shadow-sm cursor-pointer"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            <div className="text-right min-w-[80px]">
                                                <p className="font-black text-gray-800">{(itemPrice * item.quantity).toLocaleString()}đ</p>
                                            </div>

                                            <button 
                                                onClick={() => handleRemoveItem(product._id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-2 cursor-pointer"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Checkout Section */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Summary Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-xl font-black text-gray-800 mb-6">Tóm tắt đơn hàng</h2>
                        <div className="space-y-4 pb-6 border-b border-gray-100">
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Tạm tính ({totalItems} sản phẩm)</span>
                                <span>{totalAmount.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-medium">
                                <span>Phí vận chuyển</span>
                                <span className="text-green-500 font-bold">Miễn phí</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end pt-6 mb-6">
                            <span className="font-black text-gray-800 text-lg">Tổng cộng</span>
                            <span className="font-black text-orange-600 text-2xl">{totalAmount.toLocaleString()}đ</span>
                        </div>
                    </div>

                    {/* Delivery Form Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-orange-500" /> Thông tin giao hàng
                        </h2>
                        
                        <form onSubmit={handleCheckout} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <User className="h-3 w-3" /> Người nhận
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Họ và tên của bạn"
                                    value={shippingAddress.fullName}
                                    onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> Số điện thoại
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Số điện thoại nhận hàng"
                                    value={shippingAddress.phone}
                                    onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Địa chỉ giao hàng
                                </label>
                                <textarea 
                                    placeholder="Địa chỉ chi tiết (Số nhà, đường, phường/xã, quận/huyện...)"
                                    rows="3"
                                    value={shippingAddress.address}
                                    onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-800 resize-none"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <CreditCard className="h-3 w-3" /> Phương thức thanh toán
                                </label>
                                <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-orange-500 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-orange-950">COD</p>
                                            <p className="text-[10px] text-orange-600 font-bold">Thanh toán khi nhận hàng</p>
                                        </div>
                                    </div>
                                    <ShieldCheck className="h-5 w-5 text-orange-500" />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={checkoutLoading}
                                className="w-full mt-6 py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {checkoutLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                                ) : (
                                    <>Thanh Toán COD ({totalAmount.toLocaleString()}đ)</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
