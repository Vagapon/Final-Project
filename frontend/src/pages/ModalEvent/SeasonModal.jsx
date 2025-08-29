import React, { useState, useEffect } from "react";
import { X, Play, CheckCircle } from "lucide-react";
import axios from "axios";

const SeasonModal = ({ isOpen, onClose, season, onSave, mode }) => {
  // Di chuyển imageOptions lên đầu
  const imageOptions = [
    {
      path: "https://res.cloudinary.com/dpqeefuto/image/upload/v1755672378/c7088df551317fb2915a5f15f10ae8ee_to9yio.jpg",
      name: "Xanh dương",
      preview: "linear-gradient(135deg, #00ffff 0%, #0088cc 100%)",
    },
    {
      path: "https://res.cloudinary.com/dpqeefuto/image/upload/v1755672378/DesignStudio-Robin-Brand-Consultants-logo-design-premier-league-football-2_lmqrjm.png",
      name: "Tím",
      preview: "linear-gradient(135deg, #9c27b0 0%, #6a1b9a 100%)",
    },
    {
      path: "https://res.cloudinary.com/dpqeefuto/image/upload/v1755672379/t%E1%BA%A3i_xu%E1%BB%91ng_mbzykh.png",
      name: "Hồng",
      preview: "linear-gradient(135deg, #ff4081 0%, #e91e63 100%)",
    },
    {
      path: "https://res.cloudinary.com/dpqeefuto/image/upload/v1755672378/DesignStudio-Robin-Brand-Consultants-logo-design-premier-league-football-3_xqyic2.png",
      name: "Xanh lá",
      preview: "linear-gradient(135deg, #00ff88 0%, #00cc66 100%)",
    },
  ];

  const [formData, setFormData] = useState({
    name: "",
    status: "active",
    startDate: "",
    endDate: "",
    backgroundImage: imageOptions[0].path, // Set default ngay từ đầu
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(imageOptions[0].path);

  // Helper function để format date cho input type="date"
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    // Nếu dateString đã là định dạng YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Nếu là ISO string hoặc format khác, convert về YYYY-MM-DD
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.log("Error formatting date:", error);
      return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!formData.name.trim() || !formData.startDate || !formData.endDate) {
      alert(
        "Vui lòng điền đầy đủ thông tin bắt buộc (Tên, Ngày bắt đầu, Ngày kết thúc)"
      );
      setLoading(false);
      return;
    }

    // Debug: Log data trước khi gửi
    console.log("Data being sent:", formData);
    console.log("Selected image:", selectedImage);

    try {
      const token = localStorage.getItem("token");
      let response;
      // Ensure backgroundImage is sent explicitly from the currently selected option
      const payload = {
        ...formData,
        backgroundImage: selectedImage || formData.backgroundImage,
      };

      if (mode === "create") {
        response = await axios.post(
          "http://localhost:5000/api/season",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setMessage("✅ Season đã được tạo thành công!");
      } else if (mode === "edit") {
        response = await axios.put(
          `http://localhost:5000/api/season/${season._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setMessage("✅ Season đã được cập nhật thành công!");
      }

      if (onSave) onSave(response.data.data);

      if (mode === "create") {
        // Reset form về default
        const defaultData = {
          name: "",
          status: "active",
          startDate: "",
          endDate: "",
          backgroundImage: imageOptions[0].path,
        };
        setFormData(defaultData);
        setSelectedImage(imageOptions[0].path);
      }

      setTimeout(() => {
        onClose();
        setMessage("");
      }, 1500);
    } catch (error) {
      setMessage(`❌ Lỗi: ${error.response?.data?.message || "Có lỗi xảy ra"}`);
    } finally {
      setLoading(false);
    }
  };

  // Sửa lại useEffect để xử lý đúng việc load dữ liệu
  useEffect(() => {
    console.log("useEffect triggered:", { isOpen, mode, season }); // Debug log

    if (!isOpen) {
      // Reset message khi đóng modal
      setMessage("");
      return;
    }

    if (mode === "create") {
      // Chế độ create - reset form
      const defaultData = {
        name: "",
        status: "active",
        startDate: "",
        endDate: "",
        backgroundImage: imageOptions[0].path,
      };
      setFormData(defaultData);
      setSelectedImage(imageOptions[0].path);
    } else if ((mode === "edit" || mode === "view") && season) {
      // Chế độ edit/view - load dữ liệu hiện có
      console.log("Loading season data:", season); // Debug log

      const formattedData = {
        name: season.name || "",
        status: season.status || "active",
        startDate: formatDateForInput(season.startDate),
        endDate: formatDateForInput(season.endDate),
        backgroundImage: season.backgroundImage || imageOptions[0].path,
      };

      console.log("Formatted form data:", formattedData); // Debug log
      setFormData(formattedData);
      setSelectedImage(season.backgroundImage || imageOptions[0].path);
    }

    // Reset message khi mở modal
    setMessage("");
  }, [isOpen, season, mode]);

  // Thêm useEffect riêng để debug khi formData thay đổi
  useEffect(() => {
    console.log("FormData updated:", formData);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Hàm riêng để xử lý chọn ảnh - đảm bảo sync cả 2 state
  const handleImageSelect = (imagePath) => {
    console.log("Image selected:", imagePath); // Debug log
    setSelectedImage(imagePath);
    handleChange("backgroundImage", imagePath);
  };

  const statusOptions = [
    {
      value: "active",
      label: "Active",
      description: "Season đang hoạt động",
      icon: Play,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      selectedBg: "bg-green-100",
      selectedBorder: "border-green-500",
    },
    {
      value: "completed",
      label: "Completed",
      description: "Season đã hoàn thành",
      icon: CheckCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      selectedBg: "bg-blue-100",
      selectedBorder: "border-blue-500",
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2
            className="text-xl font-bold"
            style={{
              background:
                "linear-gradient(135deg, #00bcd4 0%, #2196f3 25%, #9c27b0 75%, #e91e63 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {mode === "create"
              ? "TẠO SEASON MỚI"
              : mode === "edit"
                ? "CHỈNH SỬA SEASON"
                : "CHI TIẾT SEASON"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === "view" ? (
            // View Mode
            <div className="space-y-4">
              <dl className="space-y-3">
                <div>
                  <dt className="block text-sm font-medium text-gray-700 mb-1">Tên Season</dt>
                  <dd className="text-gray-900 bg-gray-50 p-2 rounded">{season?.name}</dd>
                </div>
                <div>
                  <dt className="block text-sm font-medium text-gray-700 mb-1">Mô tả</dt>
                  <dd className="text-gray-900 bg-gray-50 p-2 rounded min-h-[60px]">{season?.description || "Không có mô tả"}</dd>
                </div>
                <div>
                  <dt className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</dt>
                  <dd className="flex items-center">
                    {(() => {
                      const currentStatus = statusOptions.find((opt) => opt.value === season?.status);
                      const IconComponent = currentStatus?.icon || Play;
                      return (
                        <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${currentStatus?.bgColor} ${currentStatus?.borderColor}`}>
                          <IconComponent size={16} className={currentStatus?.color} />
                          <span className={`font-medium ${currentStatus?.color}`}>{currentStatus?.label}</span>
                        </div>
                      );
                    })()}
                  </dd>
                </div>
                <div>
                  <dt className="block text-sm font-medium text-gray-700 mb-2">Hình nền hiện tại</dt>
                  <dd>
                    <div className="w-full h-24 rounded-lg border overflow-hidden">
                      <img
                        src={season?.backgroundImage || imageOptions[0].path}
                        alt="Background"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</dt>
                    <dd className="text-gray-900 bg-gray-50 p-2 rounded">{formatDateForInput(season?.startDate)}</dd>
                  </div>
                  <div>
                    <dt className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</dt>
                    <dd className="text-gray-900 bg-gray-50 p-2 rounded">{formatDateForInput(season?.endDate)}</dd>
                  </div>
                </div>
              </dl>
            </div>
          ) : (
            // Create/Edit Mode
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Season <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên season..."
                />
              </div>

              {/* Improved Status Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Trạng thái
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {statusOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isSelected = formData.status === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange("status", option.value)}
                        className={`w-full p-2 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] ${
                          isSelected
                            ? `${option.selectedBg} ${option.selectedBorder} shadow-md`
                            : `${option.bgColor} ${option.borderColor} hover:${option.selectedBg}`
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <IconComponent
                            size={16}
                            className={`${option.color}`}
                          />
                          <span
                            className={`font-medium text-sm ${option.color}`}
                          >
                            {option.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image Selection - Chỉ giữ 1 section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn hình nền
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {imageOptions.map((option) => (
                    <button
                      key={option.path}
                      type="button"
                      onClick={() => handleImageSelect(option.path)}
                      className={`relative w-full h-16 rounded-lg border-2 transition-all hover:scale-105 overflow-hidden ${
                        formData.backgroundImage === option.path
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-300"
                      }`}
                      title={option.name}
                    >
                      {/* Preview ảnh thật */}
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `url(${option.path})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>

                      {formData.backgroundImage === option.path && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30"></div>
                      )}
                    </button>
                  ))}
                </div>
                {/* Debug info */}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    min={
                      formData.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {/* Debug info */}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {mode === "view" ? "Đóng" : "Hủy"}
          </button>
          {mode !== "view" && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading
                ? "Đang xử lý..."
                : mode === "create"
                  ? "Tạo Season"
                  : "Cập Nhật"}
            </button>
          )}
        </div>

        {/* Message display */}
        {message && (
          <div className="px-6 pb-4">
            <div
              className={`p-3 rounded-lg text-sm ${
                message.includes("✅")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonModal;
