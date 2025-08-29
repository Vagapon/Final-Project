import { useState, useEffect } from "react";
import {
  Upload,
  Calendar,
  Users,
  MapPin,
  Clock,
  Star,
  Heart,
  Save,
  X,
  Trophy,
  Zap,
  Target,
} from "lucide-react";
import axios from "axios";

const BaseModal = ({ isOpen, onClose, title, size = "lg", children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "bg-opacity-50" : "bg-opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          sizeClasses[size]
        } ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
};

const Create = ({ isOpen, onClose, onCreateEvent }) => {
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
          // maxTeams: "",
    status: "upcoming",
    avatar: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [sportTypes, setSportTypes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleChange = (e) => {
    if (e.target.name === "avatar") {
      setFormData({
        ...formData,
        avatar: e.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get('http://localhost:5000/api/season/sport-types', { headers })
      .then((res) => setSportTypes(res.data?.data || []))
      .catch((err) => console.error('Error fetching sport types:', err));

    axios
      .get('http://localhost:5000/api/season', { headers })
      .then((res) => setSeasons(res.data?.data || []))
      .catch((err) => console.error('Error fetching seasons:', err));
  }, []);

  const statusOptions = [
    {
      value: "upcoming",
      label: "Upcoming",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "ongoing",
      label: "Ongoing",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "completed",
      label: "Completed",
      color: "bg-gray-100 text-gray-800",
    },
  ];

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Event name is required";
      if (!formData.sportTypeId)
        newErrors.sportTypeId = "Sport type is required";
      if (!formData.seasonId) newErrors.seasonId = "Season is required";
 
    }

    if (step === 2) {
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.endDate) newErrors.endDate = "End date is required";
      if (
        formData.startDate &&
        formData.endDate &&
        new Date(formData.startDate) >= new Date(formData.endDate)
      ) {
        newErrors.endDate = "End date must be after start date";
      }
      if (!formData.maxTeams || parseInt(formData.maxTeams) < 1) newErrors.maxTeams = "Max teams must be at least 1";
      if (!formData.location.trim())
        newErrors.location = "Location is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
          image: "Image size must be less than 5MB",
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

  const nextStep = () => {
    const valid = validateStep(currentStep);
    console.log("Next Step clicked. Is valid?", valid, errors, formData);
    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };
  

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async(e) => {
    
    e.preventDefault();
    
    if (!validateStep(3)) return;

    try {
      const token = localStorage.getItem('token');

      // Create FormData to send file
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('sportTypeId', formData.sportTypeId);
      formDataToSend.append('seasonId', formData.seasonId);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('location', formData.location);
      // numberOfMatch will be calculated automatically on backend
      formDataToSend.append('status', formData.status);
      formDataToSend.append('maxTeams', parseInt(formData.maxTeams) || 0);
      
      // Append avatar file if selected
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      const headers = {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData, let browser set it automatically
      };

      const response = await axios.post('http://localhost:5000/api/event', formDataToSend, { headers });
      
      if (response.status === 201) {
        console.log('Event created successfully:', response.data);
        // The backend returns the event object directly, not wrapped in data property
        const eventData = response.data;
        if (eventData && eventData._id) {
          onCreateEvent(eventData);
        } else {
          console.error('Invalid event data received from API:', eventData);
          alert('Event created but invalid data received. Please refresh the page.');
        }
    handleClose();
      }
    } catch (error) {
      console.error('Error creating event:', error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to create event. Please try again.');
      }
    }
  };

  const handleClose = () => {
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
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-6 pt-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          Basic Information
        </h3>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Event Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter event name..."
          className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
            errors.name
              ? "border-red-300 bg-red-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        />
        {errors.name && (
          <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <X className="w-3 h-3" />
            {errors.name}
          </small>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Sport Type *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sportTypes.map((sport) => {
            const IconComponent = sport.icon || Trophy;
  return (
              <div
                key={sport._id}
                onClick={() =>
                  handleInputChange({
                    target: { name: "sportTypeId", value: sport._id },
                  })
                }
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                  formData.sportTypeId === sport._id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="text-center">
                  <IconComponent className={`w-8 h-8 mx-auto mb-2 ${sport.color || ''}`} />
                  <p className="text-sm font-medium text-gray-900">
                    {sport.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {errors.sportTypeId && (
          <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <X className="w-3 h-3" />
            {errors.sportTypeId}
          </small>
        )}
      </div>

             <div>
         <label className="block text-sm font-semibold text-gray-700 mb-3">
           Season *
         </label>
         <select
           name="seasonId"
           value={formData.seasonId}
           onChange={handleInputChange}
           className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
             errors.seasonId
               ? "border-red-300 bg-red-50"
               : "border-gray-200 hover:border-gray-300"
           }`}
         >
           <option value="">Select season...</option>
           {seasons.map((season) => (
             <option key={season._id} value={season._id}>
               {season.name} ({new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()})
             </option>
           ))}
         </select>
         {formData.seasonId && (
           <small className="text-gray-500 text-sm mt-1 block">
             Season period: {(() => {
               const selectedSeason = seasons.find(s => s._id === formData.seasonId);
               return selectedSeason ? 
                 `${new Date(selectedSeason.startDate).toLocaleDateString()} to ${new Date(selectedSeason.endDate).toLocaleDateString()}` : 
                 '';
             })()}
           </small>
         )}
         {errors.seasonId && (
           <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
             <X className="w-3 h-3" />
             {errors.seasonId}
           </small>
         )}
       </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 pt-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mb-4">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Date & Location</h3>
      </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
           <label className="block text-sm font-semibold text-gray-700 mb-3">
             Start Date *
           </label>
           <input
             type="date"
             name="startDate"
             value={formData.startDate}
             onChange={handleInputChange}
             min={(() => {
               const selectedSeason = seasons.find(s => s._id === formData.seasonId);
               const today = new Date().toISOString().split('T')[0];
               if (selectedSeason) {
                 const seasonStart = new Date(selectedSeason.startDate).toISOString().split('T')[0];
                 return seasonStart > today ? seasonStart : today;
               }
               return today;
             })()}
             max={(() => {
               const selectedSeason = seasons.find(s => s._id === formData.seasonId);
               return selectedSeason ? new Date(selectedSeason.endDate).toISOString().split('T')[0] : '';
             })()}
             className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
               errors.startDate
                 ? "border-red-300 bg-red-50"
                 : "border-gray-200 hover:border-gray-300"
             }`}
           />
           {errors.startDate && (
             <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
               <X className="w-3 h-3" />
               {errors.startDate}
             </small>
           )}
         </div>

         <div>
           <label className="block text-sm font-semibold text-gray-700 mb-3">
             End Date *
           </label>
           <input
             type="date"
             name="endDate"
             value={formData.endDate}
             onChange={handleInputChange}
             min={formData.startDate || (() => {
               const selectedSeason = seasons.find(s => s._id === formData.seasonId);
               const today = new Date().toISOString().split('T')[0];
               if (selectedSeason) {
                 const seasonStart = new Date(selectedSeason.startDate).toISOString().split('T')[0];
                 return seasonStart > today ? seasonStart : today;
               }
               return today;
             })()}
             max={(() => {
               const selectedSeason = seasons.find(s => s._id === formData.seasonId);
               return selectedSeason ? new Date(selectedSeason.endDate).toISOString().split('T')[0] : '';
             })()}
             className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
               errors.endDate
                 ? "border-red-300 bg-red-50"
                 : "border-gray-200 hover:border-gray-300"
             }`}
           />
           {errors.endDate && (
             <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
               <X className="w-3 h-3" />
               {errors.endDate}
             </small>
           )}
         </div>
       </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Location/Venue Name *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., National Stadium, Sports Center..."
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
              errors.location
                ? "border-red-300 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          />
        </div>
        {errors.location && (
          <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <X className="w-3 h-3" />
            {errors.location}
          </small>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Full Address
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter complete address for GPS navigation..."
          rows="3"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Max Teams *
          </label>
          <input
            type="number"
            name="maxTeams"
            value={formData.maxTeams}
            onChange={handleInputChange}
            min="1"
            placeholder="Enter number of teams"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
          />
          <small className="text-gray-500 mt-1 block">
            Number of matches will be calculated automatically: {formData.maxTeams ? Math.floor((parseInt(formData.maxTeams) * (parseInt(formData.maxTeams) - 1)) / 2) : 0} matches
          </small>
          {errors.maxTeams && (
            <small className="text-red-500 mt-1 block">
              {errors.maxTeams}
            </small>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Number of Matches (Auto-calculated)
          </label>
          <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600">
            {formData.maxTeams ? Math.floor((parseInt(formData.maxTeams) * (parseInt(formData.maxTeams) - 1)) / 2) : 0} matches
          </div>
          <small className="text-gray-500 mt-1 block">
            Based on round-robin tournament: n(n-1)/2
          </small>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Status
          </label>
          <div className="flex gap-2">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() =>
                  handleInputChange({
                    target: { name: "status", value: status.value },
                  })
                }
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  formData.status === status.value
                    ? status.color + " shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 pt-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
          <Star className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Final Details</h3>
        <small className="text-gray-500 mt-1 block">
          Add description and images to complete your event
        </small>
      </div>

        <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
            Event Image
          </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-all duration-200 hover:bg-gray-50">
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                className="mx-auto h-40 w-full object-cover rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                   setFormData((prev) => ({ ...prev, avatar: null }));
                  }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div>
                  <label className="cursor-pointer">
                  <span className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200">
                      Upload event image
                    </span>
                  <small className="text-sm text-gray-500 mt-1 block">
                    PNG, JPG up to 5MB
                  </small>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        {errors.image && (
          <small className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <X className="w-3 h-3" />
            {errors.image}
          </small>
        )}
          </div>

          <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          placeholder="Describe your event, rules, prizes, and what participants can expect..."
          rows="5"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
          />
        </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Sport Event"
      size="xl"
    >
      <div className="space-y-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 pt-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step === currentStep
                    ? "bg-blue-600 text-white shadow-lg scale-110"
                    : step < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step < currentStep ? "✓" : step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-1 mx-2 transition-all duration-300 ${
                    step < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[500px] transition-all duration-300">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              currentStep === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 bg-gray-100 hover:bg-gray-200 hover:scale-105"
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleClose}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Cancel
          </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 hover:scale-105 shadow-lg"
              >
                Next Step
                <Clock className="w-4 h-4" />
              </button>
            ) : (
          <button
            type="button"
            onClick={handleSubmit}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 hover:scale-105 shadow-lg"
          >
            <Save className="w-4 h-4" />
            Create Event
          </button>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default Create;
