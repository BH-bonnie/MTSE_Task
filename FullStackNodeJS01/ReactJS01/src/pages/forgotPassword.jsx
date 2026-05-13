import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import { 
    Mail, ShieldCheck, Lock, CheckCircle2, 
    Loader2, ArrowRight, ArrowLeft, KeyRound, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { forgotPasswordApi, resetPasswordApi } from "../util/api";

const initialForm = {
    email: "",
    otpCode: "",
    newPassword: "",
    confirmPassword: "",
};

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
    const [showPassword, setShowPassword] = useState(false);

    const validateStep1 = () => {
        const nextErrors = {};
        if (!form.email.trim()) nextErrors.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Invalid email format.";
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const validateStep2 = () => {
        const nextErrors = {};
        if (!form.otpCode.trim()) nextErrors.otpCode = "OTP is required.";
        else if (!/^\d{5}$/.test(form.otpCode.trim())) nextErrors.otpCode = "OTP must be 5 digits.";
        
        if (!form.newPassword) nextErrors.newPassword = "New password is required.";
        else if (form.newPassword.length < 6) nextErrors.newPassword = "Min 6 characters.";
        
        if (form.newPassword !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setServerError("");
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!validateStep1()) return;
        setSubmitting(true);
        setServerError("");
        try {
            const res = await forgotPasswordApi({ email: form.email.trim() });
            if (!res.data?.success) throw new Error(res.data?.message || "Failed to send OTP.");
            messageApi.success("OTP sent successfully!");
            setStep(2);
        } catch (error) {
            setServerError(error.response?.data?.message || error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;
        setSubmitting(true);
        setServerError("");
        try {
            const res = await resetPasswordApi({
                email: form.email.trim(),
                otpCode: form.otpCode.trim(),
                newPassword: form.newPassword,
            });
            if (!res.data?.success) throw new Error(res.data?.message || "Failed to reset password.");
            messageApi.success("Password reset successful!");
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            setServerError(error.response?.data?.message || error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFDFB] flex items-center justify-center p-4 md:p-8">
            {contextHolder}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl shadow-orange-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]"
            >
                {/* Left Column: Branding */}
                <div className="hidden md:flex md:w-5/12 bg-[#F97316] p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
                    
                    <div className="relative z-10">
                        <Link to="/login" className="flex items-center gap-2 text-white group">
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-bold">Back to Login</span>
                        </Link>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                            <KeyRound className="text-white h-8 w-8" />
                        </div>
                        <h1 className="text-4xl font-black text-white leading-tight">
                            Security <br />
                            Is Our <br />
                            <span className="text-orange-200">Priority.</span>
                        </h1>
                        <p className="text-orange-100/80 font-medium">
                            Don't worry, it happens to the best of us. Let's get your account back safely.
                        </p>
                    </div>

                    <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div className="text-white">
                                <p className="text-xs font-black uppercase tracking-widest opacity-60">Status</p>
                                <p className="font-bold">System Online & Secure</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div 
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-black text-gray-800 mb-2">Forgot Password?</h2>
                                        <p className="text-gray-400 font-medium">Enter your email to receive a 5-digit OTP code.</p>
                                    </div>

                                    {serverError && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3">
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                            {serverError}
                                        </div>
                                    )}

                                    <form onSubmit={handleSendOTP} className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                                <input 
                                                    name="email" type="email" value={form.email} onChange={handleChange}
                                                    placeholder="example@mail.com"
                                                    className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-gray-700 ${errors.email ? 'border-red-100' : 'border-transparent focus:border-orange-500/20 focus:bg-white'}`}
                                                />
                                            </div>
                                            {errors.email && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.email}</p>}
                                        </div>

                                        <button
                                            type="submit" disabled={submitting}
                                            className="w-full bg-gray-800 text-white py-4 rounded-[20px] font-black text-lg shadow-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-3"
                                        >
                                            {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-6 w-6" />}
                                            Send Reset Code
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-black text-gray-800 mb-2">Reset Password</h2>
                                        <p className="text-gray-400 font-medium">Verify your email and choose a new password.</p>
                                    </div>

                                    {serverError && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3">
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                            {serverError}
                                        </div>
                                    )}

                                    <form onSubmit={handleResetPassword} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">OTP Code</label>
                                            <div className="relative group">
                                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                                <input 
                                                    name="otpCode" type="text" maxLength={5} value={form.otpCode} onChange={handleChange}
                                                    placeholder="5 digits"
                                                    className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-gray-700 tracking-[1em] ${errors.otpCode ? 'border-red-100' : 'border-transparent focus:border-orange-500/20 focus:bg-white'}`}
                                                />
                                            </div>
                                            {errors.otpCode && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.otpCode}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                                <input 
                                                    name="newPassword" type={showPassword ? "text" : "password"} value={form.newPassword} onChange={handleChange}
                                                    placeholder="Min. 6 chars"
                                                    className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-12 outline-none transition-all font-bold text-gray-700 ${errors.newPassword ? 'border-red-100' : 'border-transparent focus:border-orange-500/20 focus:bg-white'}`}
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            {errors.newPassword && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.newPassword}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                                <input 
                                                    name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                                                    placeholder="Re-type password"
                                                    className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-gray-700 ${errors.confirmPassword ? 'border-red-100' : 'border-transparent focus:border-orange-500/20 focus:bg-white'}`}
                                                />
                                            </div>
                                            {errors.confirmPassword && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.confirmPassword}</p>}
                                        </div>

                                        <button
                                            type="submit" disabled={submitting}
                                            className="w-full bg-orange-500 text-white py-4 rounded-[20px] font-black text-lg shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-3"
                                        >
                                            {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                                            Update Password
                                        </button>
                                        
                                        <button type="button" onClick={() => setStep(1)} className="w-full text-center text-xs font-black text-gray-400 uppercase tracking-widest hover:text-orange-500 transition-colors">
                                            Request another OTP
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-12 text-center">
                            <p className="text-gray-400 font-medium">
                                Back to safety? <Link to="/login" className="text-orange-500 font-black hover:underline ml-1">Login here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
