'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
        }
    }
    User.init({
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        address: DataTypes.STRING,
        gender: DataTypes.BOOLEAN,
        roleId: DataTypes.INTEGER,
        phone: DataTypes.STRING,
        avatar: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'User',
    });
    return User;
};