const orderService = require("../services/orderService");

const checkout = async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin giao hàng" });
        }
        const order = await orderService.checkout(req.user.id, shippingAddress);
        res.status(201).json({ success: true, order, message: "Đặt hàng thành công!" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const { status, page, limit } = req.query;
        const result = await orderService.getOrders(
            req.user.id,
            status,
            parseInt(page) || 1,
            parseInt(limit) || 10
        );
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await orderService.getOrderById(req.user.id, id);
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason || reason.trim() === "") {
            return res.status(400).json({ success: false, message: "Vui lòng nhập lý do hủy đơn" });
        }
        const order = await orderService.cancelOrder(req.user.id, id, reason);
        res.status(200).json({ success: true, order, message: "Đã xử lý yêu cầu hủy đơn hàng" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Admin Controllers
const getAllOrders = async (req, res) => {
    try {
        const { status, page, limit } = req.query;
        const result = await orderService.getAllOrders(
            status,
            parseInt(page) || 1,
            parseInt(limit) || 10
        );
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: "Vui lòng truyền trạng thái mới" });
        }
        const order = await orderService.updateOrderStatus(id, status, note);
        res.status(200).json({ success: true, order, message: "Đã cập nhật trạng thái đơn hàng" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    checkout,
    getOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
};
