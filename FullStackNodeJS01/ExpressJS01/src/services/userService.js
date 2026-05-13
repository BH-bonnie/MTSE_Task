require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailService = require("./mailService");
const saltRounds = 10;

const createUserService = async (name, email, password) => {
    try {
        const user = await User.findOne({ email });
        if (user) {
            console.log(`>>> user exist, chọn 1 email khác: ${email}`);
            return null;
        }

        const hashPassword = await bcrypt.hash(password, saltRounds)
        let result = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: "User"
        });
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}
const loginService = async (email, password) => {
    try {
        const user = await User.findOne({ email: email });
        if (user) {
            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                return {
                    EC: 2,
                    EM: "Email/Password không hợp lệ"
                }
            }
            else {
                const payload = {
                    email: user.email,
                    name: user.name
                }
                const access_token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_EXPIRE
                    }
                )
                return {
                    EC: 0,
                    access_token,
                    user: {
                        email: user.email,
                        name: user.name
                    }
                };
            }
        } else {
            return {
                EC: 1,
                EM: "Email/Password không hợp lệ"
            }
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}
const getUserService = async () => {
    try {
        let result = await User.find({}).select("-password");
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

// Giả lập lưu trữ OTP trong bộ nhớ (hoặc bạn có thể dùng Redis/DB)
const otpStore = new Map();

const sendVerificationCodeService = async (email) => {
    try {
        const otp = Math.floor(10000 + Math.random() * 90000).toString();
        otpStore.set(email, otp);
        
        // Gửi email thật
        await mailService.sendOTPEmail(email, otp);
        
        console.log(`>>> [Email OTP Sent to ${email}]: ${otp}`);
        return { success: true, message: "OTP has been sent to your email!" };
    } catch (error) {
        console.log(error);
        return { success: false, message: "Failed to send email. Please try again later." };
    }
}


const forgotPasswordService = async (email) => {
    const user = await User.findOne({ email });
    if (!user) return { success: false, message: "Email not found" };
    return await sendVerificationCodeService(email);
}

const resetPasswordService = async (email, otpCode, newPassword) => {
    const savedOtp = otpStore.get(email);
    if (savedOtp !== otpCode) return { success: false, message: "Invalid OTP" };
    
    const hashPassword = await bcrypt.hash(newPassword, saltRounds);
    await User.updateOne({ email }, { password: hashPassword });
    otpStore.delete(email);
    return { success: true, message: "Password updated successfully" };
}

const getProfileService = async (email) => {
    const user = await User.findOne({ email }).select("-password");
    if (!user) return { success: false, message: "User not found" };
    return { success: true, user };
}

const updateProfileService = async (email, data) => {
    const user = await User.findOneAndUpdate(
        { email },
        { 
            name: data.name,
            phone: data.phone,
            address: data.address,
            gender: data.gender,
            avatar: data.avatar
        },
        { new: true }
    ).select("-password");
    
    if (!user) return { success: false, message: "User not found" };
    return { success: true, user };
}

module.exports = { 
    createUserService, 
    loginService, 
    getUserService,
    sendVerificationCodeService,
    forgotPasswordService,
    resetPasswordService,
    getProfileService,
    updateProfileService
};
