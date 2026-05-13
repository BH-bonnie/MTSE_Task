const express = require("express");
const { 
    createUser, handleLogin, getUser, getAccount,
    handleSendVerificationCode, handleForgotPassword, handleResetPassword,
    handleGetProfile, handleUpdateProfile 
} = require("../controllers/userController");

const productController = require("../controllers/productController");

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
routerAPI.get("/products/:id", productController.getProductById);
routerAPI.get("/categories", productController.getCategories);

// Protected routes
routerAPI.get("/user", auth, getUser);
routerAPI.get("/account", auth, delay, getAccount);
routerAPI.get("/profile/me", auth, handleGetProfile);
routerAPI.put("/profile/me", auth, handleUpdateProfile);


module.exports = routerAPI;