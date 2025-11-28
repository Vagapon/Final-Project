import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Mail,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { message } from "antd";
import authService from "../../api/auth/authService";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Verify OTP, 3: Reset password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef();
  const [isMuted, setIsMuted] = useState(true);

  const [messageApi, contextHolder] = message.useMessage();

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const normalizeEmail = () => email.trim().toLowerCase();

  const handleSendOTP = async () => {
    const normalizedEmail = normalizeEmail();
    if (!normalizedEmail) {
      messageApi.error("Please enter a valid email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      messageApi.error("Invalid email format");
      return;
    }

    setEmail(normalizedEmail);
    setIsSendingOTP(true);
    try {
      await authService.forgotPassword(normalizedEmail);
      setStep(2);
      setOtp('');
      setCountdown(60);
      messageApi.success("OTP has been sent to your email");
    } catch (error) {
      console.error("Send OTP error:", error);
      messageApi.error(error?.message || error?.error || "Failed to send OTP!");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      messageApi.error("Please enter all 6 digits of OTP");
      return;
    }

    setIsVerifyingOTP(true);
    try {
      await authService.verifyResetOtp(normalizeEmail(), otp);
      setStep(3);
      messageApi.success("OTP verified successfully!");
    } catch (error) {
      console.error("Verify OTP error:", error);
      messageApi.error(error?.message || error?.error || "OTP verification failed!");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) {
      messageApi.error("Invalid OTP code");
      return;
    }
    if (newPassword !== confirmPassword) {
      messageApi.error("Password confirmation does not match!");
      return;
    }
    if (newPassword.length < 6) {
      messageApi.error("Password must be at least 6 characters!");
      return;
    }

    setIsResettingPassword(true);
    try {
      await authService.resetPassword({
        email: normalizeEmail(),
        otp,
        newPassword,
        confirmPassword,
      });
      messageApi.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Reset password error:", error);
      messageApi.error(error?.message || error?.error || "Password reset failed!");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || isSendingOTP) return;
    await handleSendOTP();
  };

  const handleGoBack = () => {
    const previousStep = step - 1;
    if (previousStep < 1) return;
    setStep(previousStep);
    if (previousStep === 1) {
      setOtp('');
      setCountdown(0);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        Enter your registered email to receive a 6-digit OTP code. The code is valid for
        <strong> 10 minutes</strong>.
      </div>

      <button
        onClick={handleSendOTP}
        disabled={isSendingOTP || !email}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSendingOTP ? "Sending..." : "Send OTP via Email"}
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Enter OTP Code
        </h3>
        <p className="text-gray-600">
          We sent a verification code to <strong>{email}</strong>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          OTP Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
          className="w-full px-3 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-[0.5rem]"
          maxLength={6}
        />
      </div>

      <button
        onClick={handleVerifyOTP}
        disabled={isVerifyingOTP || otp.length !== 6}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isVerifyingOTP ? "Verifying..." : "Verify OTP"}
      </button>

      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-gray-500">
            Resend OTP in {countdown}s
          </p>
        ) : (
          <button
            onClick={handleResendOTP}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Reset Password
        </h3>
        <p className="text-gray-600">
          Please enter your new password
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <button
        onClick={handleResetPassword}
        disabled={
          isResettingPassword ||
          !newPassword ||
          !confirmPassword ||
          otp.length !== 6
        }
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isResettingPassword ? "Resetting..." : "Reset Password"}
      </button>
    </div>
  );

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Forgot Password";
      case 2: return "Verify OTP";
      case 3: return "Reset Password";
      default: return "Forgot Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "Enter your registered email to receive an OTP code";
      case 2: return "Enter the OTP code sent to your email";
      case 3: return "Create a new password for your account";
      default: return "Enter your registered email to receive an OTP code";
    }
  };

  return (
    <div className="min-h-screen flex">
      {contextHolder}
      {/* Left side - Forgot password form */}
      <div className="flex-1 bg-white">
        <div className="min-h-full flex flex-col justify-start px-4 sm:px-6 lg:px-16 xl:px-20 py-8">
          {/* Logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <img
              src="favicon/logoicon.png"
              alt="Logo"
              className="h-16 w-auto"
            />
          </div>

          <div className="mx-auto w-full max-w-sm lg:max-w-md">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm">Back to Login</span>
            </button>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getStepTitle()}
              </h1>
              <p className="text-gray-600">
                {getStepDescription()}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= stepNumber
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {stepNumber}
                    </div>
                    {stepNumber < 3 && (
                      <div
                        className={`w-12 h-1 mx-2 ${
                          step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form content */}
            <div className="mb-6">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </div>

            {/* Back button for steps 2-4 */}
            {step > 1 && (
              <div className="text-center">
                <button
                  onClick={handleGoBack}
                  className="text-blue-600 hover:text-blue-500 font-medium text-sm"
                >
                  ← Go to Previous Step
                </button>
              </div>
            )}

            {/* Sign up link */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Video background */}
      <div className="hidden lg:flex flex-1 relative bg-transparent overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover brightness-100 contrast-110"
        >
          <source
            src="https://res.cloudinary.com/dlespzsu6/video/upload/v1751071582/footballs_ccdtxt.mp4"
            type="video/mp4"
          />
        </video>
        <button
          onClick={handleToggleMute}
          className="absolute bottom-6 right-6 z-20 text-black px-2 py-1 rounded-lg shadow transition"
        >
          {isMuted ? "🔇" : "🔊"}
        </button>

        <div className="relative z-10 flex flex-col justify-center items-center text-center px-12">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-16 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 right-8 w-16 h-16 bg-blue-400/20 rounded-full blur-lg"></div>
        </div>
      </div>
    </div>
  );
}