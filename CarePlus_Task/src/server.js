import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./routes/web";
import connectDB from "./config/configdb";
require("dotenv").config();

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
viewEngine(app);
initWebRoutes(app);

// Global Error Handlers to catch crashes
process.on('unhandledRejection', (reason, promise) => {
    console.error('>>> Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('>>> Uncaught Exception thrown:', err);
});

let port = process.env.PORT || 6969;

(async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`Server chạy tại http://localhost:${port}`);
        });
    } catch (e) {
        process.exit(1);
    }
})();