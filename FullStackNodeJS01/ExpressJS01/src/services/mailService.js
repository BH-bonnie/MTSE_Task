const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html,
        });
        console.log(">>> Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error(">>> Error sending email:", error);
        throw error;
    }
};

const sendOTPEmail = async (email, otp) => {
    const subject = `[BonnieTea] Verification Code: ${otp}`;
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #F97316; margin: 0;">BonnieTea</h1>
                <p style="color: #666; font-size: 14px;">Premium Drinks Experience</p>
            </div>
            <div style="background-color: #FFFDFB; padding: 30px; border-radius: 20px; border: 1px solid #FFF5ED;">
                <h2 style="color: #333; margin-top: 0;">Verification Code</h2>
                <p style="color: #555; line-height: 1.6;">Hello,</p>
                <p style="color: #555; line-height: 1.6;">You are performing a secure action on BonnieTea. Please use the following One-Time Password (OTP) to complete the process:</p>
                
                <div style="text-align: center; margin: 40px 0;">
                    <span style="font-size: 48px; font-weight: 900; letter-spacing: 10px; color: #F97316; background: #fff; padding: 15px 30px; border-radius: 15px; border: 2px dashed #F97316;">${otp}</span>
                </div>
                
                <p style="color: #888; font-size: 13px; line-height: 1.6;">This code is valid for 10 minutes. If you did not request this, please ignore this email or contact support.</p>
            </div>
            <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                <p>&copy; 2026 BonnieTea Shop. All rights reserved.</p>
            </div>
        </div>
    `;
    
    return await sendEmail(email, subject, `Your OTP is ${otp}`, html);
};

module.exports = { sendOTPEmail };
