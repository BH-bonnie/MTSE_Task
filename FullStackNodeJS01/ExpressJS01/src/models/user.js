const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    gender: { type: Boolean, default: null },
    avatar: { type: String },
    role: { type: String, default: "member" },
    isActive: { type: Boolean, default: true },
    isLocked: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;