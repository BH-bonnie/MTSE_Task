import { Sequelize } from "sequelize";
const sequelize = new Sequelize('node_fullstack', 'root', 'root', {
    host: 'localhost',
    dialect: ' mysql',
    logging: false
});
let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connecton has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    };
}
module.exports = connectDB