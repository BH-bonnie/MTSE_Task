const nodemailer = require('nodemailer');
require('dotenv').config();

const sendOTPEmail = async (email, otp) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: process.env.SMTP_PORT_2 || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER_2, 
                pass: process.env.SMTP_PASS_2, 
            },
        });

        let info = await transporter.sendMail({
            from: '"CarePlus Support" <no-reply@careplus.com>',
            to: email,
            subject: "Mã OTP Khôi phục mật khẩu - CarePlus",
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #4CAF50;">Yêu cầu khôi phục mật khẩu</h2>
                <p>Chào bạn,</p>
                <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản liên kết với địa chỉ email này.</p>
                <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #d9534f;">${otp}</strong></p>
                <p>Mã này có hiệu lực trong vòng 10 phút. Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
                <br/>
                <p>Trân trọng,</p>
                <p><strong>Đội ngũ CarePlus</strong></p>
            </div>
            `,
        });

        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Lỗi khi gửi email:", error);
        throw error;
    }
};

module.exports = {
    sendOTPEmail,
};


