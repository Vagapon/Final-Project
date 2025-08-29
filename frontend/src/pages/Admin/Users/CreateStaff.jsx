import React, { useState } from "react";
import { UserPlus, Eye, EyeOff, Upload, X, User, Mail, Phone, Key, Camera } from "lucide-react";

const CreateStaff = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    avatar: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        avatar: file,
      });
      
      // Tạo preview cho ảnh
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setAvatarPreview(e.target.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const removeAvatar = () => {
    setFormData({
      ...formData,
      avatar: null,
    });
    setAvatarPreview(null);
    // Reset file input
    const fileInput = document.getElementById('avatar');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Lấy token từ localStorage (giữ nguyên logic gốc)
      const token = window.localStorage?.getItem("token") || "demo-token";

      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("phone_number", formData.phone_number);
      data.append("avatar", formData.avatar);

      // Simulate API call (thay thế axios vì không có trong môi trường này)
      const response = await fetch("http://localhost:5000/api/auth/create-staff", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (response.ok) {
        setMessage("✅ Tạo tài khoản Staff thành công!");
        setFormData({
          name: "",
          email: "",
          password: "",
          phone_number: "",
          avatar: null,
        });
        setAvatarPreview(null);
        // Reset file input
        const fileInput = document.getElementById('avatar');
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error("API Error");
      }
    } catch (error) {
      setMessage(`❌ Lỗi: ${error.message || "Có lỗi xảy ra"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Tạo tài khoản Staff</h1>
              <p className="text-sm text-gray-500">Thêm nhân viên mới vào hệ thống</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              message.includes("✅")
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="font-medium">{message}</div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h2>
                <p className="text-sm text-gray-500 mt-1">Điền đầy đủ thông tin nhân viên</p>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Họ và tên
                      </div>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Nhập họ và tên đầy đủ"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="staff@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Số điện thoại
                      </div>
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="0123456789"
                    />
                  </div>

                  {/* Password */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Mật khẩu
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Nhập mật khẩu"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Tạo tài khoản Staff
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">Preview</h3>
                <p className="text-sm text-gray-500 mt-1">Xem trước thông tin</p>
              </div>
              
              <div className="p-6">
                {/* Avatar Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Avatar
                    </div>
                  </label>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      {avatarPreview ? (
                        <div className="relative">
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                          />
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-400 text-center">Chưa có ảnh</span>
                        </div>
                      )}
                    </div>
                    
                    <input
                      type="file"
                      name="avatar"
                      id="avatar"
                      accept="image/*"
                      onChange={handleChange}
                      required
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar"
                      className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {avatarPreview ? "Đổi ảnh" : "Tải ảnh lên"}
                    </label>
                  </div>
                </div>

                {/* Info Preview */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Thông tin nhân viên</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gray-500">Họ tên:</span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formData.name || "Chưa nhập"}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Email:</span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formData.email || "Chưa nhập"}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Điện thoại:</span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formData.phone_number || "Chưa nhập"}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Mật khẩu:</span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formData.password ? "••••••••" : "Chưa nhập"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStaff;