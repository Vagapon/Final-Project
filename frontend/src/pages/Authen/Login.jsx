import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebaseconfigurations/config";
// Toast Component with Progress Bar
const Toast = ({
  message,
  type = "success",
  isVisible,
  onClose,
  duration = 4000,
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingTimeRef = useRef(duration);

  useEffect(() => {
    if (isVisible && !isPaused) {
      startTimeRef.current = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, remainingTimeRef.current - elapsed);
        const newProgress = (remaining / duration) * 100;

        setProgress(newProgress);

        if (remaining <= 0) {
          clearInterval(interval);
          onClose();
        }
      }, 16); // ~60fps

      return () => clearInterval(interval);
    }
  }, [isVisible, isPaused, duration, onClose]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (startTimeRef.current) {
      remainingTimeRef.current = Math.max(
        0,
        remainingTimeRef.current - (Date.now() - startTimeRef.current)
      );
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  const getToastStyles = () => {
    const baseStyles =
      "fixed top-6 left-1/2 transform -translate-x-1/2 z-50 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-500 ease-out max-w-md w-full mx-4 overflow-hidden";

    switch (type) {
      case "success":
        return `${baseStyles} bg-green-50/95 border-green-200`;
      case "error":
        return `${baseStyles} bg-red-50/95 border-red-200`;
      case "warning":
        return `${baseStyles} bg-yellow-50/95 border-yellow-200`;
      case "info":
        return `${baseStyles} bg-blue-50/95 border-blue-200`;
      default:
        return `${baseStyles} bg-white/95 border-gray-200`;
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      case "info":
        return "text-blue-800";
      default:
        return "text-gray-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`${getToastStyles()} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200/50">
        <div
          ref={progressRef}
          className={`h-full transition-all duration-75 ease-linear ${getProgressColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Toast Content */}
      <div className="px-6 py-4">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <div className="flex-1">
            <p
              className={`text-sm font-medium leading-relaxed ${getTextColor()}`}
            >
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Hook for Toast
const useToast = () => {
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    isVisible: false,
    duration: 4000,
  });

  const showToast = (message, type = "success", duration = 4000) => {
    setToast({ message, type, isVisible: true, duration });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  return { toast, showToast, hideToast };
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const { login } = useAuth();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Hiển thị toast loading
    showToast("Đang xác thực thông tin...", "info", 10000);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token } = response.data;
      const meRes = await axios.get("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = meRes.data;
      login(userData, token); // Sử dụng hook login để lưu user và token
      // Ghi đè lại user info có role
      // localStorage.setItem("user", JSON.stringify(userData));

      console.log("Login successful:", userData);

      // Đóng toast loading và hiển thị toast thành công
      hideToast();
      setTimeout(() => {
        showToast(
          `Chào mừng ${userData.name || "bạn"} trở lại! 🎉`,
          "success",
          3000
        );
      }, 100);

      setTimeout(() => {
        showToast("✨ Chúc bạn có một ngày tuyệt vời!", "info", 2000);
      }, 2000);

      // Chuyển hướng sau 3 giây
      setTimeout(() => {
        if (userData.role === "ADMIN" || userData.role === "STAFF") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 3000);
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);

      // Đóng toast loading
      hideToast();

      // Hiển thị toast lỗi với thời gian phù hợp
      setTimeout(() => {
        const errorMessage = error.response?.data?.message;

        if (error.response?.status === 404) {
          showToast(
            "Email không tồn tại! Vui lòng kiểm tra lại.",
            "error",
            5000
          );
        } else if (error.response?.status === 401) {
          showToast(
            "Mật khẩu không chính xác! Vui lòng thử lại.",
            "error",
            5000
          );
        } else if (error.response?.status === 403) {
          showToast(
            "Tài khoản bị khóa! Liên hệ admin để được hỗ trợ.",
            "warning",
            6000
          );
        } else {
          showToast(
            errorMessage || "Đăng nhập thất bại. Vui lòng thử lại.",
            "error",
            4000
          );
        }
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (user) {
      navigate(user.role === "ADMIN"|| user.role === "STAFF" ? "/admin" : "/", { replace: true });
    }
  }, [user, navigate]);
  // Video functionality
  const videoRef = useRef();
  const [isMuted, setIsMuted] = useState(true);

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  async function handleGoogleLogin() { 
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Lấy Google ID token
      const idToken = await user.getIdToken();
      
      // Gửi token lên backend để verify và lấy user info
      const response = await axios.post('http://localhost:5000/api/auth/firebase-login', {
        idToken: idToken
      });
      
      // Lưu user info vào AuthContext
      const userData = response.data.user;
      const token = response.data.token;
      
      // Sử dụng login function từ AuthContext
      login(userData, token);
      
      // Navigate về home
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
      // Có thể hiển thị toast error ở đây
    }
  }
  return (
    <div className="min-h-screen flex">
      {/* Toast Notification with Progress Bar */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={toast.duration}
      />

      {/* Left side - Login form */}
      <div className="flex-1 bg-white">
        <div className="min-h-full flex flex-col justify-start px-4 sm:px-6 lg:px-16 xl:px-20 py-8">
          {/* Back button */}
          {/* Logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <img
              src="favicon/logoicon.png" // ✅ Đường dẫn tới ảnh logo (nên để trong public/)
              alt="Logo"
              className="h-16 w-auto" // Bạn có thể điều chỉnh kích thước
            />
          </div>

          <div className="mx-auto w-full max-w-sm lg:max-w-md">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm">Back to home</span>
            </button>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
              <p className="text-gray-600">
                Enter your email and password to sign in!
              </p>
            </div>

            {/* Social login buttons */}
            <div className="mb-6">
              <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium">Sign in with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@gmail.com"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    autoComplete="new-password"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="keep-logged-in"
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="keep-logged-in"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Keep me logged in
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang xác thực..." : "Sign in"}
              </button>
            </form>

            {/* Sign up link */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign Up
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
