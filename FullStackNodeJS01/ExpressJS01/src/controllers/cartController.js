const cartService = require("../services/cartService");

const getCart = async (req, res) => {
    try {
        const cart = await cartService.getCart(req.user.id);
        res.status(200).json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await cartService.addToCart(req.user.id, productId, quantity);
        res.status(200).json({ success: true, cart, message: "Đã thêm sản phẩm vào giỏ hàng" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await cartService.updateCartItem(req.user.id, productId, quantity);
        res.status(200).json({ success: true, cart, message: "Đã cập nhật số lượng" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const cart = await cartService.removeFromCart(req.user.id, productId);
        res.status(200).json({ success: true, cart, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const clearCart = async (req, res) => {
    try {
        const cart = await cartService.clearCart(req.user.id);
        res.status(200).json({ success: true, cart, message: "Đã xóa toàn bộ giỏ hàng" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
