import express from "express";

/**
 * viewEngine.js
 *
 * EJS view engine đã bị loại bỏ — toàn bộ UI được phục vụ bởi React (client-side).
 * File này chỉ giữ lại cấu hình static files nếu cần.
 */
let configViewEngine = (app) => {
    // Serve static files (hình ảnh, v.v.)
    app.use(express.static("./src/public"));
};

module.exports = configViewEngine;