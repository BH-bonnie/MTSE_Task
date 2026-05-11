import express from "express";
import authController from "../controllers/authController";
import homeController from "../controllers/homeController";
import profileController from "../controllers/profileController";
import authRoutes from "./auth";
import apiRoutes from "./api";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", (req, res) => {
        return res.redirect("/home");
    });

    router.get("/home", homeController.getHomePage);
    router.get("/about", homeController.getAboutPage);

    router.get("/login", authController.getLoginPage);
    router.get("/register", authController.getRegisterPage);
    router.get("/forgot-password", authController.getForgotPasswordPage);
    router.post("/forgot-password", authController.postForgotPassword);
    router.get("/reset-password", authController.getResetPasswordPage);
    router.post("/reset-password", authController.postResetPassword);

    router.get("/crud", homeController.getCRUD);
    router.post("/post-crud", homeController.postCRUD);
    router.get("/get-crud", homeController.getFindAllCRUD);
    router.get("/edit-crud", homeController.getEditCRUD);
    router.post("/put-crud", homeController.putCRUD);
    router.get("/delete-crud", homeController.deleteCRUD);

    router.get("/admin/profile", profileController.getAdminProfilePage);
    router.get("/user/profile", profileController.getUserProfilePage);
    router.get("/user/profile/edit", profileController.getUserProfileEditPage);

    app.use("/", authRoutes);
    app.use("/", apiRoutes);
    return app.use("/", router);
};

module.exports = initWebRoutes;
