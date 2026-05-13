require("dotenv").config();
const connection = require("./src/config/database");
const seedData = require("./src/services/seedService");

(async () => {
    try {
        await connection();
        await seedData();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
