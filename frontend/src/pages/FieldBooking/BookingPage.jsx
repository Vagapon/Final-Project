import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Check, ArrowLeft } from 'lucide-react';
import { fieldBookingService } from '../../api';
import { message } from 'antd';
import { useAuth } from '../Authen/AuthContext';
import ProgressIndicator from '../../components/Booking/ProgressIndicator';
import Step1Content from '../../components/Booking/Step1Content';
import Step2Content from '../../components/Booking/Step2Content';
import Step3Content from '../../components/Booking/Step3Content';
import { formatPrice } from '../../utils/formatPrice';

const BookingPage = () => {
  const { fieldId, timeSlotId, date } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [field, setField] = useState(null);
  const [timeSlot, setTimeSlot] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedBookingDate, setSelectedBookingDate] = useState(date);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState(timeSlotId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (fieldId && timeSlotId && date) {
      loadBookingData();
    }
  }, [fieldId, timeSlotId, date]);

  useEffect(() => {
    if (fieldId && selectedBookingDate) {
      loadTimeSlotsForDate(fieldId, selectedBookingDate);
    }
  }, [fieldId, selectedBookingDate]);

  // Update timeSlot when selectedTimeSlotId changes
  useEffect(() => {
    if (selectedTimeSlotId && availableTimeSlots.length > 0) {
      const selectedSlot = availableTimeSlots.find(slot => slot._id === selectedTimeSlotId);
      if (selectedSlot) {
        setTimeSlot(selectedSlot);
      }
    }
  }, [selectedTimeSlotId, availableTimeSlots]);

  const loadBookingData = async () => {
    try {
      setLoading(true);
      const [fieldData, timeSlotData] = await Promise.all([
        fieldBookingService.getFieldById(fieldId),
        fieldBookingService.getTimeSlots(fieldId, { date: selectedBookingDate })
      ]);
      
      setField(fieldData);
      setAvailableTimeSlots(timeSlotData || []);
      
      const selectedTimeSlot = timeSlotData?.find(slot => slot._id === timeSlotId);
      
      if (!selectedTimeSlot) {
        // If time slot not found, create a default one
        const defaultTimeSlot = {
          _id: timeSlotId,
          startTime: '18:00',
          endTime: '19:30',
          timeType: 'ca_toi',
          multiplier: 1.5
        };
        setTimeSlot(defaultTimeSlot);
      } else {
        setTimeSlot(selectedTimeSlot);
      }
    } catch (error) {
      console.error('Error loading booking data:', error);
      message.error('Không thể tải thông tin đặt sân');
      navigate('/book');
    } finally {
      setLoading(false);
    }
  };

  const getTimeTypeText = (timeType) => {
    const timeTypeMap = {
      'ca_sang': 'Sáng',
      'ca_chieu': 'Chiều', 
      'ca_toi': 'Tối'
    };
    return timeTypeMap[timeType] || 'Sáng';
  };

  const loadTimeSlotsForDate = async (fieldId, selectedDate) => {
    try {
      const timeSlotData = await fieldBookingService.getTimeSlots(fieldId, { date: selectedDate });
      setAvailableTimeSlots(timeSlotData || []);
    } catch (error) {
      console.error('Error loading time slots:', error);
      message.error('Không thể tải khung giờ');
    }
  };

  const getCurrentImage = () => {
    const images = field?.images || [];
    if (images.length === 0) {
      return 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=400&fit=crop&crop=center';
    }
    return images[currentImageIndex] || images[0];
  };

  const basePrice = field?.pricePerHour || 0;
  const totalPrice = timeSlot ? (basePrice * timeSlot.multiplier) : basePrice;

  const handleNext = () => {
    // Validation for step 1
    if (currentStep === 1) {
      console.log('Validation check:', {
        selectedBookingDate,
        selectedTimeSlotId,
        timeSlot,
        user: !!user
      });
      
      if (!selectedBookingDate) {
        message.error('Vui lòng chọn ngày đặt sân');
        return;
      }
      if (!selectedTimeSlotId || !timeSlot) {
        message.error('Vui lòng chọn khung giờ');
        return;
      }
      if (!user) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        return;
      }
    }
    
    if (currentStep < 3) {
      console.log('Moving to step:', currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      
      const bookingData = {
        fieldId,
        timeSlotId: selectedTimeSlotId,
        date: selectedBookingDate,
        notes: bookingNotes
      };

      const response = await fieldBookingService.createBooking(bookingData);
      
      if (response.success) {
      message.success('Đặt sân thành công!');
        setCurrentStep(3);
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi đặt sân');
      }
    } catch (error) {
      console.error('Booking error:', error);
      message.error('Có lỗi xảy ra khi đặt sân');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !field) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin đặt sân...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100">
      <ProgressIndicator currentStep={currentStep} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 ">
        {currentStep === 1 && (
          <Step1Content
            field={field}
            selectedBookingDate={selectedBookingDate}
            setSelectedBookingDate={setSelectedBookingDate}
            availableTimeSlots={availableTimeSlots}
            selectedTimeSlotId={selectedTimeSlotId}
            setSelectedTimeSlotId={setSelectedTimeSlotId}
            timeSlot={timeSlot}
            bookingNotes={bookingNotes}
            setBookingNotes={setBookingNotes}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            getCurrentImage={getCurrentImage}
            getTimeTypeText={getTimeTypeText}
            basePrice={basePrice}
            totalPrice={totalPrice}
          />
        )}

        {currentStep === 2 && (
          <Step2Content
            field={field}
            timeSlot={timeSlot}
            selectedBookingDate={selectedBookingDate}
            basePrice={basePrice}
            totalPrice={totalPrice}
            getTimeTypeText={getTimeTypeText}
            user={user}
          />
        )}

        {currentStep === 3 && (
          <Step3Content
            field={field}
            timeSlot={timeSlot}
            selectedBookingDate={selectedBookingDate}
            basePrice={basePrice}
            totalPrice={totalPrice}
            bookingNotes={bookingNotes}
            user={user}
            getTimeTypeText={getTimeTypeText}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            {currentStep > 1 && (
          <button
            onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-all border border-gray-300 hover:border-gray-400"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
          </button>
            )}
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn hủy đặt sân? Thông tin đã nhập sẽ bị mất.')) {
                  navigate('/book');
                }
              }}
              className="px-6 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-medium transition-all border border-gray-300 hover:border-red-300"
            >
              Hủy đặt sân
            </button>
          </div>
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-all shadow-sm hover:shadow-md"
              >
                Tiếp tục
              <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleConfirmBooking}
                disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Xác nhận đặt sân
                  <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;