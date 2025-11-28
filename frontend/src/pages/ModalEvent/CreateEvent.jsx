import { useEventForm } from "../../hooks/useEventForm";
import BaseModal from "../../components/Modal/BaseModal";
import StepIndicator from "../../components/EventForm/StepIndicator";
import Step1 from "../../components/EventForm/Step1";
import Step2 from "../../components/EventForm/Step2";
import Step3 from "../../components/EventForm/Step3";
import NavigationButtons from "../../components/EventForm/NavigationButtons";
import eventApi from "../../api/eventManagement/eventApi";

const CreateEvent = ({ isOpen, onClose, onCreateEvent }) => {
  const {
    formData,
    imagePreview,
    currentStep,
    errors,
    sportTypes,
    seasons,
    loading,
    setLoading,
    handleInputChange,
    handleImageUpload,
    removeImage,
    validateStep,
    nextStep,
    prevStep,
    resetForm,
  } = useEventForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('sportTypeId', formData.sportTypeId);
      formDataToSend.append('seasonId', formData.seasonId);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('maxTeams', parseInt(formData.maxTeams) || 0);
      
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      console.log('Sending form data:', {
        name: formData.name,
        sportTypeId: formData.sportTypeId,
        seasonId: formData.seasonId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        maxTeams: formData.maxTeams
      });

      const response = await eventApi.createEvent(formDataToSend);
      
      console.log('Event creation response:', response);
      
      if (response.status === 201 || response.data?.success) {
        console.log('Event created successfully:', response.data);
        if (response.data?.data) {
          onCreateEvent(response.data.data);
          handleClose();
        } else {
          console.error('Invalid event data received from API:', response.data);
          alert('Event created but invalid data received. Please refresh the page.');
        }
      } else {
        console.error('Unexpected response format:', response);
        alert('Event created but unexpected response format. Please refresh the page.');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        alert('Request bị timeout. Vui lòng thử lại hoặc kiểm tra kết nối mạng.');
      } else if (error.response?.data?.message) {
        alert(`Lỗi: ${error.response.data.message}`);
      } else if (error.response?.data?.error) {
        alert(`Lỗi: ${error.response.data.error}`);
      } else if (error.message) {
        alert(`Lỗi: ${error.message}`);
      } else {
        alert('Không thể tạo sự kiện. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
  return (
          <Step1
            formData={formData}
            errors={errors}
            sportTypes={sportTypes}
            seasons={seasons}
            handleInputChange={handleInputChange}
          />
        );
      case 2:
        return (
          <Step2
            formData={formData}
            errors={errors}
            seasons={seasons}
            handleInputChange={handleInputChange}
          />
        );
      case 3:
        return (
          <Step3
            formData={formData}
            errors={errors}
            imagePreview={imagePreview}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            onRemoveImage={removeImage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Sport Event"
      size="xl"
    >
      <div className="space-y-8">
        <StepIndicator currentStep={currentStep} totalSteps={3} />

        <div className="min-h-[500px] transition-all duration-300">
          {renderCurrentStep()}
        </div>

        <NavigationButtons
          currentStep={currentStep}
          totalSteps={3}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </div>
    </BaseModal>
  );
};

export default CreateEvent;
