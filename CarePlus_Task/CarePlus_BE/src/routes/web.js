import express from "express";
import homeController from "../controllers/homeController";
import authRoutes from "./auth";
import apiRoutes from "./api";

let router = express.Router();

/**
 * Web Routes — chỉ giữ lại các route không phụ thuộc EJS profile/auth views
 * Toàn bộ UI profile đã chuyển sang React (client-side)
 */
let initWebRoutes = (app) => {
    // CRUD demo routes (giữ lại nếu cần dùng cho testing)
    router.get("/crud", homeController.getCRUD);
    router.post("/post-crud", homeController.postCRUD);
    router.get("/get-crud", homeController.getFindAllCRUD);
    router.get("/edit-crud", homeController.getEditCRUD);
    router.post("/put-crud", homeController.putCRUD);
    router.get("/delete-crud", homeController.deleteCRUD);

    app.use("/", authRoutes);
    app.use("/", apiRoutes);
    return app.use("/", router);
};

module.exports = initWebRoutes;
