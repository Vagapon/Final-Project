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
import FieldInfo from '../../components/Booking/FieldInfo';
import OrderSummary from '../../components/Booking/OrderSummary';
import { formatPrice } from '../../utils/formatPrice';

const BookingPage = () => {
  const { fieldId, timeSlotId, date } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Lưu state vào sessionStorage để giữ khi reload
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = sessionStorage.getItem('bookingStep');
    return saved ? parseInt(saved) : 1;
  });
  const [loading, setLoading] = useState(true);
  const [field, setField] = useState(null);
  const [timeSlot, setTimeSlot] = useState(null);
  const [bookingNotes, setBookingNotes] = useState(() => {
    return sessionStorage.getItem('bookingNotes') || '';
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedBookingDate, setSelectedBookingDate] = useState(date);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState(timeSlotId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bookingId, setBookingId] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [validationError, setValidationError] = useState('');

  // Lưu state khi thay đổi
  useEffect(() => {
    sessionStorage.setItem('bookingStep', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    if (bookingId) {
      sessionStorage.setItem('currentBookingId', bookingId);
    }
  }, [bookingId]);

  useEffect(() => {
    if (qrData) {
      sessionStorage.setItem('bookingQrData', JSON.stringify(qrData));
    }
  }, [qrData]);

  useEffect(() => {
    sessionStorage.setItem('bookingPaymentStatus', paymentStatus);
  }, [paymentStatus]);

  useEffect(() => {
    sessionStorage.setItem('bookingNotes', bookingNotes);
  }, [bookingNotes]);

  // Clear old booking data when starting a new booking
  useEffect(() => {
    if (!fieldId || !date) return;
    
    const savedBookingId = sessionStorage.getItem('currentBookingId');
    const savedFieldId = sessionStorage.getItem('lastBookingFieldId');
    const savedTimeSlotId = sessionStorage.getItem('lastBookingTimeSlotId');
    const savedDate = sessionStorage.getItem('lastBookingDate');
    
    // Kiểm tra xem có phải booking mới không
    const isNewBooking = !savedBookingId || 
                         savedFieldId !== fieldId || 
                         savedDate !== date ||
                         (timeSlotId && savedTimeSlotId && savedTimeSlotId !== timeSlotId);
    
    if (isNewBooking && savedBookingId) {
      // Clear booking cũ khi vào booking mới
      console.log('New booking detected, clearing old booking data');
      sessionStorage.removeItem('currentBookingId');
      sessionStorage.removeItem('bookingQrData');
      sessionStorage.removeItem('bookingPaymentStatus');
      sessionStorage.removeItem('bookingStep');
      sessionStorage.removeItem('bookingNotes');
      setBookingId(null);
      setQrData(null);
      setPaymentStatus('unpaid');
      setCurrentStep(1);
    } else if (!isNewBooking && savedBookingId) {
      // Load booking data từ sessionStorage nếu là booking cũ
      console.log('Loading existing booking data from sessionStorage');
      setBookingId(savedBookingId);
      const savedQrData = sessionStorage.getItem('bookingQrData');
      if (savedQrData) {
        try {
          setQrData(JSON.parse(savedQrData));
        } catch (e) {
          console.error('Error parsing QR data:', e);
        }
      }
      setPaymentStatus(sessionStorage.getItem('bookingPaymentStatus') || 'unpaid');
      const savedStep = sessionStorage.getItem('bookingStep');
      if (savedStep) {
        setCurrentStep(parseInt(savedStep));
      }
    }
    
    // Lưu thông tin booking hiện tại
    sessionStorage.setItem('lastBookingFieldId', fieldId);
    if (timeSlotId) {
      sessionStorage.setItem('lastBookingTimeSlotId', timeSlotId);
    }
    sessionStorage.setItem('lastBookingDate', date);
    
    // Load booking data nếu có đủ thông tin
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
      message.error('Unable to load booking information');
      navigate('/book');
    } finally {
      setLoading(false);
    }
  };

  const getTimeTypeText = (timeType) => {
    const timeTypeMap = {
      'ca_sang': 'Morning',
      'ca_chieu': 'Afternoon', 
      'ca_toi': 'Evening'
    };
    return timeTypeMap[timeType] || 'Morning';
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

  // Tính duration từ time slot (giờ) - chỉ để hiển thị, KHÔNG dùng để tính giá
  const calculateDuration = () => {
    if (!timeSlot?.startTime || !timeSlot?.endTime) return 1;
    
    const [startHour, startMin] = timeSlot.startTime.split(':').map(Number);
    const [endHour, endMin] = timeSlot.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return (endMinutes - startMinutes) / 60; // Convert to hours
  };

  const basePrice = field?.pricePerHour || 0; // Giá cố định theo ca (không phải giá/giờ)
  const duration = calculateDuration(); // Chỉ để hiển thị
  const totalPrice = timeSlot ? (basePrice * timeSlot.multiplier) : basePrice; // GIÁ CỐ ĐỊNH × HỆ SỐ CA

  const handleNext = async () => {
    // Validation for step 1
    if (currentStep === 1) {
      console.log('Validation check:', {
        selectedBookingDate,
        selectedTimeSlotId,
        timeSlot,
        user: !!user
      });
      
      if (!selectedBookingDate) {
        setValidationError('Please select a booking date');
        message.warning({
          content: 'Please select a booking date',
          duration: 3
        });
        return;
      }
      if (!selectedTimeSlotId || !timeSlot) {
        setValidationError('Please select a time slot to continue');
        message.warning({
          content: 'Please select a time slot to continue',
          duration: 3
        });
        // Scroll to time slot section
        const timeSlotSection = document.querySelector('[data-section="timeslot"]');
        if (timeSlotSection) {
          timeSlotSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      if (!user) {
        setValidationError('');
        message.error({
          content: 'Please login to continue',
          duration: 3
        });
        return;
      }
      
      // Clear validation error if all checks pass
      setValidationError('');

      // Tạo booking và QR khi chuyển sang step 2
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
          setBookingId(response.data._id);
          
          // Tạo QR thanh toán
          const qrResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/qr/${response.data._id}`);
          const qrResult = await qrResponse.json();
          
          if (qrResult.success) {
            setQrData(qrResult);
            setCurrentStep(2);
          } else {
            message.error('Unable to create payment QR code');
          }
        } else {
          message.error(response.message || 'An error occurred while creating booking');
        }
      } catch (error) {
        console.error('Booking error:', error);
        message.error('An error occurred while creating booking');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    if (currentStep < 3) {
      console.log('Moving to step:', currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = async () => {
    if (currentStep > 1) {
      // Nếu đang ở step 2 (thanh toán), cần hủy booking trước khi quay lại
      if (currentStep === 2 && bookingId) {
        const confirmed = window.confirm(
          'Are you sure you want to go back?\n\n' +
          'The payment QR code will be cancelled and you need to select the time again.'
        );
        
        if (!confirmed) return;
        
        try {
          setLoading(true);
          // Hủy booking đã tạo để giải phóng timeslot
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No authentication token found');
          }
          
          // Sử dụng cancelBooking thay vì deleteBooking để an toàn hơn
          const cancelResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${bookingId}/cancel`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const cancelResult = await cancelResponse.json();
          
          if (!cancelResponse.ok || !cancelResult.success) {
            // Nếu cancel không thành công, thử delete
            const deleteResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${bookingId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!deleteResponse.ok) {
              const deleteResult = await deleteResponse.json();
              throw new Error(deleteResult.message || 'Failed to cancel booking');
            }
          }
          
          // Reset states và sessionStorage
          setBookingId(null);
          setQrData(null);
          setPaymentStatus('unpaid');
          sessionStorage.removeItem('currentBookingId');
          sessionStorage.removeItem('bookingQrData');
          sessionStorage.removeItem('bookingPaymentStatus');
          
          // Reload timeslots để cập nhật trạng thái available
          if (fieldId && selectedBookingDate) {
            await loadTimeSlotsForDate(fieldId, selectedBookingDate);
          }
          
          message.success('Booking cancelled. You can select the time again.');
          setCurrentStep(1);
        } catch (error) {
          console.error('Error canceling booking:', error);
          const errorMessage = error.message || 'Unable to cancel booking. Please try again.';
          message.error(errorMessage);
        } finally {
          setLoading(false);
        }
      }
      
      setCurrentStep(currentStep - 1);
    }
  };

  // Poll payment status khi ở step 2
  useEffect(() => {
    // Validate bookingId trước khi poll
    const isValidObjectId = (id) => {
      return id && /^[a-f\d]{24}$/i.test(id);
    };

    if (currentStep === 2 && bookingId && isValidObjectId(bookingId)) {
      console.log('🔄 Starting payment polling for booking:', bookingId);
      
      const pollInterval = setInterval(async () => {
        try {
          console.log('📡 Polling payment status...');
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/status/${bookingId}`);
          
          if (!response.ok) {
            console.error('❌ Payment status API error:', response.status);
            return;
          }
          
          const result = await response.json();
          
          console.log('📊 Payment status result:', result);
          
          if (result.success && result.paymentStatus === 'paid') {
            console.log('✅ Payment confirmed! Moving to step 3');
            setPaymentStatus('paid');
            clearInterval(pollInterval);
            message.success('Payment successful!');
            
            // Chuyển sang step 3 ngay lập tức
            setTimeout(() => {
              setCurrentStep(3);
              // Clear booking data sau khi hoàn tất
              sessionStorage.removeItem('currentBookingId');
              sessionStorage.removeItem('bookingQrData');
              sessionStorage.removeItem('bookingPaymentStatus');
              sessionStorage.removeItem('bookingStep');
              sessionStorage.removeItem('bookingNotes');
              sessionStorage.removeItem('lastBookingFieldId');
              sessionStorage.removeItem('lastBookingTimeSlotId');
              sessionStorage.removeItem('lastBookingDate');
              // Reset states
              setBookingId(null);
              setQrData(null);
              setPaymentStatus('unpaid');
            }, 2000);
          }
        } catch (error) {
          console.error('❌ Error polling payment status:', error);
        }
      }, 3000); // Poll mỗi 3 giây

      return () => {
        console.log('🛑 Stopping payment polling');
        clearInterval(pollInterval);
      };
    }
  }, [currentStep, bookingId]);

  // Handle payment timeout
  const handlePaymentTimeout = async () => {
    try {
      // Validate bookingId trước khi hủy
      const isValidObjectId = (id) => {
        return id && /^[a-f\d]{24}$/i.test(id);
      };

      // Hủy booking khi hết thời gian (chỉ nếu bookingId hợp lệ)
      if (bookingId && isValidObjectId(bookingId)) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          console.log('✅ Booking cancelled successfully');
        }
      }
      
      message.warning('Payment timeout. Please book again.');
      
      // Clear sessionStorage
      sessionStorage.removeItem('bookingStep');
      sessionStorage.removeItem('currentBookingId');
      sessionStorage.removeItem('bookingQrData');
      sessionStorage.removeItem('bookingPaymentStatus');
      sessionStorage.removeItem('bookingNotes');
      
      // Redirect về trang chọn sân sau 3 giây
      setTimeout(() => {
        navigate('/book');
      }, 3000);
    } catch (error) {
      console.error('Error canceling booking:', error);
      navigate('/book');
    }
  };

  // Clear sessionStorage khi hoàn tất (Step 3)
  useEffect(() => {
    if (currentStep === 3) {
      // Clear ngay lập tức khi hoàn tất
      sessionStorage.removeItem('bookingStep');
      sessionStorage.removeItem('currentBookingId');
      sessionStorage.removeItem('bookingQrData');
      sessionStorage.removeItem('bookingPaymentStatus');
      sessionStorage.removeItem('bookingNotes');
      sessionStorage.removeItem('lastBookingFieldId');
      sessionStorage.removeItem('lastBookingTimeSlotId');
      sessionStorage.removeItem('lastBookingDate');
      // Reset states
      setBookingId(null);
      setQrData(null);
      setPaymentStatus('unpaid');
    }
  }, [currentStep]);

  if (loading && !field) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Progress + Content */}
          <div className="lg:col-span-2 space-y-4">
            <ProgressIndicator currentStep={currentStep} />
            
            <div>
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
            duration={duration}
            validationError={validationError}
            setValidationError={setValidationError}
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
            qrData={qrData}
            paymentStatus={paymentStatus}
            bookingId={bookingId}
            onTimeout={handlePaymentTimeout}
            duration={duration}
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
            duration={duration}
          />
        )}
            </div>
          </div>

          {/* Right Column - Field Info & Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4 space-y-2">
              <FieldInfo
                field={field}
                selectedBookingDate={selectedBookingDate}
                timeSlot={timeSlot}
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex}
                getCurrentImage={getCurrentImage}
                getTimeTypeText={getTimeTypeText}
              />
              <OrderSummary
                field={field}
                timeSlot={timeSlot}
                selectedBookingDate={selectedBookingDate}
                basePrice={basePrice}
                totalPrice={totalPrice}
                getTimeTypeText={getTimeTypeText}
                user={user}
                duration={duration}
              />
            </div>
          </div>
        </div>

        {/* Navigation - Outside grid */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div className="flex gap-3">
            {currentStep > 1 && currentStep < 3 && (
          <button
            onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-all border border-gray-300 hover:border-gray-400"
              >
                <ArrowLeft className="w-4 h-4" />
                {currentStep === 2 ? 'Select Time Again' : 'Go Back'}
          </button>
            )}
            {currentStep !== 2 && currentStep !== 3 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel booking? All entered information will be lost.')) {
                    navigate('/book');
                  }
                }}
                className="px-6 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-medium transition-all border border-gray-300 hover:border-red-300"
              >
                Cancel Booking
              </button>
            )}
          </div>
            {currentStep === 1 ? (
              <button
                onClick={handleNext}
                disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : currentStep === 2 ? (
              <div className="text-sm text-gray-600">
                Please complete payment to continue
              </div>
            ) : (
              <button
                onClick={() => navigate('/book')}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-all shadow-sm hover:shadow-md"
              >
                Complete
                <Check className="w-4 h-4" />
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;