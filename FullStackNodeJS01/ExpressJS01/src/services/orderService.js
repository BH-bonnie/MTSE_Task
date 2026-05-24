const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");

// Hỗ trợ tự động xác nhận đơn hàng khi kiểm tra / tải danh sách đơn
const checkAndApplyAutoConfirmation = async (query) => {
    try {
        const now = new Date();
        const expiredNewOrders = await Order.find({
            ...query,
            status: "new",
            autoConfirmAt: { $lte: now }
        });

        for (const order of expiredNewOrders) {
            order.status = "confirmed";
            order.statusHistory.push({
                status: "confirmed",
                note: "Đơn hàng tự động xác nhận sau 30 phút (Hệ thống kiểm tra)"
            });
            await order.save();
        }
    } catch (error) {
        console.error("Lỗi khi quét tự động xác nhận đơn hàng:", error);
    }
};

const checkout = async (userId, shippingAddress) => {
    // 1. Lấy giỏ hàng của user
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
        throw new Error("Giỏ hàng của bạn đang trống");
    }

    // 2. Validate tồn kho và chuẩn bị sản phẩm
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
        const product = item.product;
        if (!product) {
            throw new Error("Sản phẩm không tồn tại");
        }
        if (product.stock < item.quantity) {
            throw new Error(`Sản phẩm '${product.name}' chỉ còn ${product.stock} trong kho`);
        }

        const price = product.promotionPrice > 0 ? product.promotionPrice : product.price;
        const itemTotal = price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
            product: product._id,
            productName: product.name,
            productImage: product.images?.[0] || "",
            price: price,
            quantity: item.quantity
        });
    }

    // 3. Trừ tồn kho và tăng lượt bán
    for (const item of cart.items) {
        const product = item.product;
        product.stock -= item.quantity;
        product.sold += item.quantity;
        await product.save();
    }

    // 4. Tạo mã đơn hàng dạng ORD-YYMMDD-XXXXX
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
    const orderCode = `ORD-${dateStr}-${randomSuffix}`;

    const autoConfirmDelay = 30 * 60 * 1000; // 30 phút
    const autoConfirmAt = new Date(Date.now() + autoConfirmDelay);

    // 5. Tạo đơn hàng
    const order = await Order.create({
        user: userId,
        orderCode,
        items: orderItems,
        shippingAddress,
        totalAmount,
        status: "new",
        statusHistory: [{
            status: "new",
            note: "Đơn hàng được đặt thành công"
        }],
        autoConfirmAt
    });

    // 6. Xóa giỏ hàng
    cart.items = [];
    await cart.save();

    // 7. Thiết lập setTimeout cho tự động xác nhận đơn hàng
    setTimeout(async () => {
        try {
            const ord = await Order.findById(order._id);
            if (ord && ord.status === "new") {
                ord.status = "confirmed";
                ord.statusHistory.push({
                    status: "confirmed",
                    note: "Đơn hàng tự động xác nhận sau 30 phút (Hẹn giờ)"
                });
                await ord.save();
                console.log(`[Hệ thống] Đã tự động xác nhận đơn hàng ${ord.orderCode}`);
            }
        } catch (err) {
            console.error("Lỗi khi tự động xác nhận đơn hàng qua timer:", err);
        }
    }, autoConfirmDelay);

    return order;
};

const getOrders = async (userId, statusFilter, page = 1, limit = 10) => {
    const query = { user: userId };
    if (statusFilter) {
        query.status = statusFilter;
    }

    // Check và xử lý tự động xác nhận các đơn hàng quá hạn của user này
    await checkAndApplyAutoConfirmation({ user: userId });

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
        orders,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getOrderById = async (userId, orderId) => {
    // Check và xử lý tự động xác nhận cho đơn hàng cụ thể này
    await checkAndApplyAutoConfirmation({ _id: orderId });

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
        throw new Error("Đơn hàng không tồn tại hoặc bạn không có quyền xem");
    }
    return order;
};

const cancelOrder = async (userId, orderId, reason) => {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
        throw new Error("Đơn hàng không tồn tại");
    }

    // Kiểm tra thời gian từ lúc đặt đơn
    const diffMs = Date.now() - new Date(order.createdAt).getTime();
    const diffMins = diffMs / (1000 * 60);

    if (order.status === "new") {
        if (diffMins <= 30) {
            // Hủy đơn trực tiếp
            order.status = "cancelled";
            order.cancelReason = reason;
            order.statusHistory.push({
                status: "cancelled",
                note: `Người dùng hủy đơn hàng (trước 30 phút). Lý do: ${reason}`
            });

            // Hoàn trả lại tồn kho sản phẩm
            for (const item of order.items) {
                if (item.product) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        product.stock += item.quantity;
                        product.sold = Math.max(0, product.sold - item.quantity);
                        await product.save();
                    }
                }
            }

            await order.save();
            return order;
        } else {
            // Đã quá 30 phút, chuyển trạng thái tự động xác nhận
            order.status = "confirmed";
            order.statusHistory.push({
                status: "confirmed",
                note: "Đơn hàng tự động xác nhận sau 30 phút (Hệ thống chuyển đổi)"
            });
            await order.save();
            throw new Error("Đơn đặt hàng đã quá 30 phút, hệ thống đã xác nhận đơn hàng này và không thể hủy trực tiếp.");
        }
    } else if (order.status === "preparing") {
        // Chuyển sang gửi yêu cầu hủy đơn cho shop duyệt
        order.status = "cancel_requested";
        order.cancelReason = reason;
        order.statusHistory.push({
            status: "cancel_requested",
            note: `Gửi yêu cầu hủy đơn hàng. Lý do: ${reason}`
        });
        await order.save();
        return order;
    } else {
        throw new Error(`Không thể hủy đơn hàng ở trạng thái này (Trạng thái hiện tại: ${order.status})`);
    }
};

// Admin Services
const getAllOrders = async (statusFilter, page = 1, limit = 10) => {
    const query = {};
    if (statusFilter) {
        query.status = statusFilter;
    }

    // Check và xử lý tự động xác nhận các đơn hàng quá hạn toàn hệ thống
    await checkAndApplyAutoConfirmation({});

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
        orders,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const updateOrderStatus = async (orderId, newStatus, note) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error("Đơn hàng không tồn tại");
    }

    const currentStatus = order.status;
    const validTransitions = {
        new: ["confirmed", "cancelled"],
        confirmed: ["preparing", "cancelled"],
        preparing: ["shipping", "cancel_requested"],
        shipping: ["delivered"],
        cancel_requested: ["cancelled", "preparing"], // Chấp nhận hủy hoặc từ chối quay lại đang chuẩn bị hàng
        delivered: [],
        cancelled: []
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
        throw new Error(`Không thể chuyển đổi trạng thái từ '${currentStatus}' sang '${newStatus}'`);
    }

    // Nếu đồng ý hủy đơn hàng ở trạng thái cancel_requested hoặc cancelled từ shop
    if (newStatus === "cancelled") {
        // Hoàn trả lại tồn kho sản phẩm
        for (const item of order.items) {
            if (item.product) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.quantity;
                    product.sold = Math.max(0, product.sold - item.quantity);
                    await product.save();
                }
            }
        }
    }

    order.status = newStatus;
    order.statusHistory.push({
        status: newStatus,
        note: note || `Cập nhật bởi Admin`
    });

    await order.save();
    return order;
};

module.exports = {
    checkout,
    getOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
};
