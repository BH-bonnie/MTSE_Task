require("dotenv").config();
const express = require("express");
const apiRoutes = require("./routes/api");
const connection = require("./config/database");
const { getHompage } = require("./controllers/homeController");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const webAPI = express.Router();
webAPI.get("/", getHompage);
app.use("/", webAPI);
app.use('/v1/api', apiRoutes);
(async () => {
    try {
        await connection();
        app.listen(port, () => {
            console.log(`Baclend Nodejs App listening on port ${port}`);
        })
    } catch (error) {
        console.log(" >>> Error connect to DB:", error);
    }

})()