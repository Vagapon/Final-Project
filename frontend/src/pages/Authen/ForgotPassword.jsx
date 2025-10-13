import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Mail,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { message } from "antd";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Choose method, 2: Enter info, 3: Verify OTP, 4: Reset password
  const [otpMethod, setOtpMethod] = useState(''); // 'phone' | 'email'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
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

  // Simplified functions - no actual OTP logic
  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      // Simulate sending OTP
      setTimeout(() => {
        setIsLoading(false);
        setStep(3);
        setCountdown(60);
        messageApi.success(`${otpMethod === 'phone' ? 'SMS' : 'Email'} OTP đã được gửi!`);
      }, 2000);
    } catch (error) {
      console.error('Send OTP error:', error);
      messageApi.error('Gửi OTP thất bại!');
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpMethod === 'phone') {
      await handleVerifyPhoneOTP();
    } else {
      await handleVerifyEmailOTP();
    }
  };

  const handleVerifyPhoneOTP = async () => {
    if (otp.length !== 6) {
      messageApi.error('Vui lòng nhập đủ 6 số OTP');
      return;
    }
    
    try {
      setIsLoading(true);
      // Simulate verification
      setTimeout(() => {
        setIsLoading(false);
        setStep(4);
        messageApi.success('OTP xác thực thành công!');
      }, 1500);
    } catch (error) {
      console.error('Phone OTP verification error:', error);
      messageApi.error('Mã OTP không đúng!');
      setIsLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    try {
      setIsLoading(true);
      // Simulate verification
      setTimeout(() => {
        setIsLoading(false);
        setStep(4);
        messageApi.success('Email xác thực thành công!');
      }, 1500);
    } catch (error) {
      console.error('Email OTP verification error:', error);
      messageApi.error('Xác thực email thất bại!');
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      messageApi.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      messageApi.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    
    try {
      setIsLoading(true);
      // Simulate password reset
      setTimeout(() => {
        setIsLoading(false);
        messageApi.success('Đặt lại mật khẩu thành công!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      messageApi.error('Đặt lại mật khẩu thất bại!');
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setCountdown(60);
    try {
      // Simulate resend
      setTimeout(() => {
        messageApi.info('Đã gửi lại OTP!');
      }, 1000);
    } catch (error) {
      console.error('Resend OTP error:', error);
      messageApi.error('Gửi lại OTP thất bại!');
    }
  };

  // Countdown timer
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Chọn phương thức xác thực
      </h3>
      
      <button
        onClick={() => {
          setOtpMethod('phone');
          setStep(2);
        }}
        className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors"
      >
        <div className="flex items-center">
          <Phone className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <div className="font-medium">SMS đến số điện thoại</div>
            <div className="text-sm text-gray-500">Nhận mã OTP qua tin nhắn SMS</div>
          </div>
        </div>
      </button>

      <button
        onClick={() => {
          setOtpMethod('email');
          setStep(2);
        }}
        className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left transition-colors"
      >
        <div className="flex items-center">
          <Mail className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <div className="font-medium">Email xác thực</div>
            <div className="text-sm text-gray-500">Nhận link xác thực qua email</div>
          </div>
        </div>
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {otpMethod === 'phone' ? 'Số điện thoại' : 'Email'} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={otpMethod === 'phone' ? 'tel' : 'email'}
            value={otpMethod === 'phone' ? phoneNumber : email}
            onChange={(e) => {
              if (otpMethod === 'phone') {
                // Only allow numbers and + sign
                const value = e.target.value.replace(/[^0-9+]/g, '');
                setPhoneNumber(value);
              } else {
                setEmail(e.target.value);
              }
            }}
            placeholder={otpMethod === 'phone' ? '0xxxxxxxxx hoặc +84xxxxxxxxx' : 'user@example.com'}
            className="w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {otpMethod === 'phone' ? (
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          ) : (
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      <button
        onClick={handleSendOTP}
        disabled={isLoading || (otpMethod === 'phone' ? !phoneNumber : !email)}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Đang gửi...' : `Gửi ${otpMethod === 'phone' ? 'SMS OTP' : 'Email xác thực'}`}
      </button>
    </div>
  );

  const renderStep3 = () => {
    if (otpMethod === 'email') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Kiểm tra email của bạn
            </h3>
            <p className="text-gray-600 mb-4">
              Chúng tôi đã gửi link xác thực đến <strong>{email}</strong>
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-blue-700 text-sm">
                <strong>Cách thực hiện:</strong>
                <ol className="mt-2 list-decimal list-inside space-y-1">
                  <li>Mở email đã gửi đến {email}</li>
                  <li>Click vào link xác thực</li>
                  <li>Bạn sẽ được chuyển hướng về trang này</li>
                  <li>Hệ thống sẽ tự động xác thực</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-yellow-700 text-sm">
                <strong>Lưu ý:</strong> Nếu không thấy email trong hộp thư chính, 
                vui lòng kiểm tra thư mục <strong>Spam/Junk</strong>
              </div>
            </div>
          </div>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Gửi lại email trong {countdown}s
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Gửi lại email xác thực
              </button>
            )}
          </div>

          <button
            onClick={() => setStep(4)}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Tôi đã click link trong email
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nhập mã OTP
          </h3>
          <p className="text-gray-600 mb-4">
            Chúng tôi đã gửi mã xác thực đến {phoneNumber}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mã OTP <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="w-full px-3 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={6}
          />
        </div>

        <button
          onClick={handleVerifyOTP}
          disabled={isLoading || otp.length !== 6}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang xác thực...' : 'Xác thực OTP'}
        </button>

        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-gray-500">
              Gửi lại mã trong {countdown}s
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Gửi lại mã OTP
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Đặt lại mật khẩu
        </h3>
        <p className="text-gray-600">
          Vui lòng nhập mật khẩu mới của bạn
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mật khẩu mới <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
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
          Xác nhận mật khẩu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
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
        disabled={isLoading || !newPassword || !confirmPassword}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
      </button>
    </div>
  );

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Quên mật khẩu";
      case 2: return "Nhập thông tin";
      case 3: return "Xác thực OTP";
      case 4: return "Đặt lại mật khẩu";
      default: return "Quên mật khẩu";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "Chọn phương thức xác thực để đặt lại mật khẩu";
      case 2: return `Nhập ${otpMethod === 'phone' ? 'số điện thoại' : 'email'} để nhận mã OTP`;
      case 3: return "Nhập mã OTP để xác thực danh tính";
      case 4: return "Tạo mật khẩu mới cho tài khoản của bạn";
      default: return "Chọn phương thức xác thực để đặt lại mật khẩu";
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
              <span className="text-sm">Quay lại đăng nhập</span>
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
                {[1, 2, 3, 4].map((stepNumber) => (
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
                    {stepNumber < 4 && (
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
              {step === 4 && renderStep4()}
            </div>

            {/* Back button for steps 2-4 */}
            {step > 1 && (
              <div className="text-center">
                <button
                  onClick={() => setStep(step - 1)}
                  className="text-blue-600 hover:text-blue-500 font-medium text-sm"
                >
                  ← Quay lại bước trước
                </button>
              </div>
            )}

            {/* Sign up link */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Đăng ký ngay
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