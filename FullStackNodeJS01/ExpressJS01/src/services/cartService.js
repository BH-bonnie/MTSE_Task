const Cart = require("../models/cart");
const Product = require("../models/product");

const getCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId }).populate({
        path: "items.product",
        populate: { path: "category" }
    });
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
};

const addToCart = async (userId, productId, quantity = 1) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Sản phẩm không tồn tại");
    
    if (product.stock < quantity) {
        throw new Error(`Sản phẩm chỉ còn ${product.stock} sản phẩm trong kho`);
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
        const newQty = cart.items[itemIndex].quantity + quantity;
        if (product.stock < newQty) {
            throw new Error(`Không thể thêm. Tổng số lượng trong giỏ (${newQty}) vượt quá tồn kho (${product.stock})`);
        }
        cart.items[itemIndex].quantity = newQty;
    } else {
        cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    return getCart(userId);
};

const updateCartItem = async (userId, productId, quantity) => {
    if (quantity < 1) throw new Error("Số lượng phải lớn hơn hoặc bằng 1");

    const product = await Product.findById(productId);
    if (!product) throw new Error("Sản phẩm không tồn tại");

    if (product.stock < quantity) {
        throw new Error(`Sản phẩm chỉ còn ${product.stock} sản phẩm trong kho`);
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Giỏ hàng không tồn tại");

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) throw new Error("Sản phẩm không có trong giỏ hàng");

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return getCart(userId);
};

const removeFromCart = async (userId, productId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Giỏ hàng không tồn tại");

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    return getCart(userId);
};

const clearCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Giỏ hàng không tồn tại");

    cart.items = [];
    await cart.save();

    return getCart(userId);
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
