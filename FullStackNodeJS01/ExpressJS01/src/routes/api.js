const express = require("express");
const { 
    createUser, handleLogin, getUser, getAccount,
    handleSendVerificationCode, handleForgotPassword, handleResetPassword,
    handleGetProfile, handleUpdateProfile 
} = require("../controllers/userController");

const productController = require("../controllers/productController");
const adminUserController = require("../controllers/adminUserController");


const auth = require('../middleware/auth');
const delay = require('../middleware/delay');
const routerAPI = express.Router();

// Public routes
routerAPI.get("/", (req, res) => {
    return res.status(200).json("Hello world api")
})
routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.post("/send-verification-code", handleSendVerificationCode);
routerAPI.post("/forgot-password", handleForgotPassword);
routerAPI.post("/reset-password", handleResetPassword);


// Product routes (Public)
routerAPI.get("/products", productController.getAllProducts);
routerAPI.get("/products/home", productController.getHomeProducts);
routerAPI.get("/products/top", productController.getTopProducts);
routerAPI.get("/products/:id", productController.getProductById);
routerAPI.get("/categories", productController.getCategories);

// Protected routes
routerAPI.get("/user", auth, getUser);
routerAPI.get("/account", auth, delay, getAccount);
routerAPI.get("/profile/me", auth, handleGetProfile);
routerAPI.put("/profile/me", auth, handleUpdateProfile);

// Cart routes (authenticated)
const cartController = require("../controllers/cartController");
routerAPI.get("/cart", auth, cartController.getCart);
routerAPI.post("/cart/add", auth, cartController.addToCart);
routerAPI.put("/cart/update", auth, cartController.updateCartItem);
routerAPI.delete("/cart/remove/:productId", auth, cartController.removeFromCart);
routerAPI.delete("/cart/clear", auth, cartController.clearCart);

// Order routes (authenticated)
const orderController = require("../controllers/orderController");
const isAdmin = require("../middleware/adminAuth");
routerAPI.post("/orders/checkout", auth, orderController.checkout);
routerAPI.get("/orders", auth, orderController.getOrders);
routerAPI.get("/orders/:id", auth, orderController.getOrderById);
routerAPI.put("/orders/:id/cancel", auth, orderController.cancelOrder);

// Admin Order routes
routerAPI.get("/admin/orders", auth, isAdmin, orderController.getAllOrders);
routerAPI.put("/admin/orders/:id/status", auth, isAdmin, orderController.updateOrderStatus);

// Admin User routes
routerAPI.get("/users", auth, isAdmin, adminUserController.getAllUsers);
routerAPI.get("/users/:id", auth, isAdmin, adminUserController.getUserById);
routerAPI.post("/users", auth, isAdmin, adminUserController.createUser);
routerAPI.put("/users/:id", auth, isAdmin, adminUserController.updateUser);
routerAPI.delete("/users/:id", auth, isAdmin, adminUserController.deleteUser);

module.exports = routerAPI;