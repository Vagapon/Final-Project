import { useState, useEffect } from "react";
import axios from "axios";

export const useEventForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sportTypeId: "",
    seasonId: "",
    startDate: "",
    endDate: "",
    address: "",
    location: "",
    maxTeams: 0,
    status: "upcoming",
    avatar: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [sportTypes, setSportTypes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      axios.get('http://localhost:5000/api/season/sport-types', { headers }),
      axios.get('http://localhost:5000/api/season', { headers })
    ])
    .then(([sportTypesRes, seasonsRes]) => {
      setSportTypes(sportTypesRes.data?.data || []);
      setSeasons(seasonsRes.data?.data || []);
    })
    .catch((err) => console.error('Error fetching data:', err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Kích thước hình ảnh phải nhỏ hơn 5MB",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Tên sự kiện là bắt buộc";
      if (formData.name.trim().length < 3) newErrors.name = "Tên sự kiện phải có ít nhất 3 ký tự";
      if (!formData.sportTypeId) newErrors.sportTypeId = "Loại thể thao là bắt buộc";
      if (!formData.seasonId) {
        newErrors.seasonId = "Mùa giải là bắt buộc";
      } else {
        // Kiểm tra nếu season đã kết thúc
        const selectedSeason = seasons.find(s => s._id === formData.seasonId);
        if (selectedSeason) {
          const seasonEndDate = new Date(selectedSeason.endDate);
          const currentDate = new Date();
          // Reset time để so sánh chỉ ngày
          seasonEndDate.setHours(0, 0, 0, 0);
          currentDate.setHours(0, 0, 0, 0);
          if (seasonEndDate < currentDate) {
            newErrors.seasonId = "Không thể chọn mùa giải đã kết thúc";
          }
        }
      }
    }

    if (step === 2) {
      if (!formData.startDate) newErrors.startDate = "Ngày bắt đầu là bắt buộc";
      if (!formData.endDate) newErrors.endDate = "Ngày kết thúc là bắt buộc";
      if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
      if (!formData.maxTeams || parseInt(formData.maxTeams) < 1) {
        newErrors.maxTeams = "Số đội tối đa phải ít nhất là 1";
      }
      if (!formData.location.trim()) newErrors.location = "Địa điểm là bắt buộc";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    const valid = validateStep(currentStep);
    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      sportTypeId: "",
      seasonId: "",
      startDate: "",
      endDate: "",
      address: "",
      location: "",
      maxTeams: "",
      status: "upcoming",
      avatar: null,
    });
    setImagePreview(null);
    setCurrentStep(1);
    setErrors({});
  };

  return {
    formData,
    setFormData,
    imagePreview,
    setImagePreview,
    currentStep,
    setCurrentStep,
    errors,
    sportTypes,
    seasons,
    loading,
    setLoading,
    handleInputChange,
    handleImageUpload,
    validateStep,
    nextStep,
    prevStep,
    resetForm,
  };
};
