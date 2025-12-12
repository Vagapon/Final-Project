import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRight, ArrowLeft, CreditCard, User, Calendar, Clock, MapPin, Star, Loader2, Shield, Award, Wifi, Car, Users } from 'lucide-react';
import { fieldBookingService } from '../../api';
import { message } from 'antd';

const BookingFlow = ({
  isOpen,
  onClose,
  field,
  selectedTimeSlot,
  selectedDate,
  bookingNotes,
  setBookingNotes,
  onConfirmBooking,
  formatPrice
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fieldDetails, setFieldDetails] = useState(null);
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: bookingNotes || ''
  });

  // Load field details when component opens
  useEffect(() => {
    if (isOpen && field) {
      loadFieldDetails();
    }
  }, [isOpen, field]);

  const loadFieldDetails = async () => {
    try {
      setLoading(true);
      const details = await fieldBookingService.getFieldDetails(field._id);
      setFieldDetails(details);
    } catch (error) {
      console.error('Error loading field details:', error);
      message.error('Unable to load field information');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !field) return null;

  const steps = [
    { id: 1, title: 'Chọn ngày & giờ', icon: Calendar, description: 'Chọn ngày, giờ và thông tin người đặt' },
    { id: 2, title: 'Thanh toán', icon: CreditCard, description: 'Thanh toán online banking' },
    { id: 3, title: 'Hoàn tất', icon: Check, description: 'Xác nhận đặt sân thành công' }
  ];

  const getMultiplier = () => {
    if (selectedTimeSlot?.timeType === 'ca_sang') return 1.0;
    if (selectedTimeSlot?.timeType === 'ca_chieu') return 1.2;
    if (selectedTimeSlot?.timeType === 'ca_toi') return 1.5;
    return 1.0;
  };

  const getTimeTypeText = () => {
    if (selectedTimeSlot?.timeType === 'ca_sang') return 'Sáng';
    if (selectedTimeSlot?.timeType === 'ca_chieu') return 'Chiều';
    if (selectedTimeSlot?.timeType === 'ca_toi') return 'Tối';
    return 'Khác';
  };

  // Giá cố định của sân (base price)
  const basePrice = field.pricePerHour;
  // Giá sau khi áp dụng multiplier của time slot
  const totalPrice = selectedTimeSlot ? (basePrice * (selectedTimeSlot.multiplier || getMultiplier())) : basePrice;

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate personal info before proceeding to payment
      if (!personalInfo.name.trim() || !personalInfo.email.trim() || !personalInfo.phone.trim()) {
        message.error('Please fill in all required information');
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personalInfo.email)) {
        message.error('Please enter a valid email');
        return;
      }
      // Basic phone validation
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(personalInfo.phone.replace(/\s/g, ''))) {
        message.error('Please enter a valid phone number (10-11 digits)');
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onConfirmBooking({
      ...personalInfo,
      totalPrice,
      multiplier: getMultiplier()
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin đặt sân</h1>
              <p className="text-gray-600">Chọn ngày, giờ và nhập thông tin người đặt</p>
            </div>

            {/* Two columns: Left form, Right order summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Date/Time + Personal Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                {/* Date and Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Ngày đặt sân *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={selectedDate}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Khung giờ *</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={`${selectedTimeSlot?.startTime} - ${selectedTimeSlot?.endTime}`}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="border-t pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Thông tin người đặt</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Họ và tên *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={personalInfo.name}
                            onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Nhập họ và tên đầy đủ"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Số điện thoại *</label>
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <input
                            type="tel"
                            value={personalInfo.phone}
                            onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0123 456 789"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Email *</label>
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <input
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="example@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Ghi chú thêm</label>
                      <div className="relative">
                        <svg className="absolute left-3 top-3 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <textarea
                          value={personalInfo.notes}
                          onChange={(e) => setPersonalInfo({...personalInfo, notes: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          rows={3}
                          placeholder="Ghi chú thêm về yêu cầu đặc biệt (không bắt buộc)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Order Summary */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h3>

                <div className="space-y-6">
                  {/* Field Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={fieldDetails?.images?.[0] || field.images?.[0] || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=100&h=100&fit=crop&crop=center'}
                        alt={field.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{field.name}</div>
                      <div className="text-sm text-gray-600">{field.location}</div>
                      <div className="text-sm text-gray-500">
                        {selectedDate} - {selectedTimeSlot?.startTime} đến {selectedTimeSlot?.endTime}
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Giá cơ bản</span>
                      <span className="font-semibold">{formatPrice(basePrice)}</span>
                    </div>
                    {selectedTimeSlot && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Hệ số {getTimeTypeText()} (x{selectedTimeSlot.multiplier || getMultiplier()})</span>
                        <span className="font-semibold text-blue-600">+{formatPrice(totalPrice - basePrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phí dịch vụ</span>
                      <span className="font-semibold">{formatPrice(50000)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Thuế VAT (10%)</span>
                      <span className="font-semibold">{formatPrice((totalPrice + 50000) * 0.1)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Tổng cộng</span>
                        <span className="text-green-600">{formatPrice((totalPrice + 50000) * 1.1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info Preview */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Thông tin liên hệ</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{personalInfo.name || 'Chưa nhập họ tên'}</div>
                      <div>{personalInfo.email || 'Chưa nhập email'}</div>
                      <div>{personalInfo.phone || 'Chưa nhập SĐT'}</div>
                    </div>
                  </div>

                  {/* Payment Security Notice */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium mb-1">Thanh toán an toàn</p>
                        <p>Giao dịch sẽ được xử lý bảo mật. Bạn sẽ chọn ngân hàng ở bước sau.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán</h1>
              <p className="text-gray-600">Chọn phương thức thanh toán online banking</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Methods */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h3>
                
                <div className="space-y-4">
                  {/* Online Banking Options */}
                  <div className="border-2 border-green-500 rounded-xl p-6 bg-green-50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">Online Banking</div>
                        <div className="text-sm text-gray-600">Thanh toán qua ngân hàng</div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Thanh toán an toàn và nhanh chóng qua các ngân hàng liên kết
                    </p>
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Shield className="w-4 h-4" />
                      <span>Bảo mật SSL 256-bit</span>
                    </div>
                  </div>

                  {/* Bank Options */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Chọn ngân hàng:</h4>
                    {[
                      { name: 'Vietcombank', logo: 'VCB', color: 'bg-blue-500' },
                      { name: 'VietinBank', logo: 'VTB', color: 'bg-red-500' },
                      { name: 'BIDV', logo: 'BIDV', color: 'bg-green-500' },
                      { name: 'Agribank', logo: 'AGB', color: 'bg-yellow-500' },
                      { name: 'Techcombank', logo: 'TCB', color: 'bg-purple-500' }
                    ].map((bank, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${bank.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                            {bank.logo}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{bank.name}</div>
                            <div className="text-sm text-gray-500">Thanh toán online</div>
                          </div>
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h3>
                
                <div className="space-y-6">
                  {/* Field Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={fieldDetails?.images?.[0] || field.images?.[0] || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=100&h=100&fit=crop&crop=center'}
                        alt={field.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{field.name}</div>
                      <div className="text-sm text-gray-600">{field.location}</div>
                      <div className="text-sm text-gray-500">
                        {selectedDate} - {selectedTimeSlot?.startTime} đến {selectedTimeSlot?.endTime}
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Giá cơ bản</span>
                      <span className="font-semibold">{formatPrice(basePrice)}</span>
                    </div>
                    {selectedTimeSlot && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Hệ số {getTimeTypeText()} (x{selectedTimeSlot.multiplier || getMultiplier()})</span>
                        <span className="font-semibold text-blue-600">+{formatPrice(totalPrice - basePrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phí dịch vụ</span>
                      <span className="font-semibold">{formatPrice(50000)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Thuế VAT (10%)</span>
                      <span className="font-semibold">{formatPrice((totalPrice + 50000) * 0.1)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Tổng cộng</span>
                        <span className="text-green-600">{formatPrice((totalPrice + 50000) * 1.1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Thông tin liên hệ</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{personalInfo.name}</div>
                      <div>{personalInfo.email}</div>
                      <div>{personalInfo.phone}</div>
                    </div>
                  </div>

                  {/* Payment Security Notice */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium mb-1">Thanh toán an toàn</p>
                        <p>Giao dịch được mã hóa SSL 256-bit và bảo vệ bởi các ngân hàng uy tín. Thông tin thẻ của bạn được bảo mật tuyệt đối.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            {/* Success Header */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Đặt sân thành công!</h1>
              <p className="text-xl text-gray-600 mb-2">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</p>
              <p className="text-gray-500">Mã đặt sân: <span className="font-mono font-bold text-green-600">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span></p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Booking Details */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Chi tiết đặt sân</h3>
                
                <div className="space-y-6">
                  {/* Field Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={fieldDetails?.images?.[0] || field.images?.[0] || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=100&h=100&fit=crop&crop=center'}
                        alt={field.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-lg">{field.name}</div>
                      <div className="text-sm text-gray-600">{field.location}</div>
                      <div className="text-sm text-gray-500">
                        {selectedDate} - {selectedTimeSlot?.startTime} đến {selectedTimeSlot?.endTime}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Thông tin liên hệ</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{personalInfo.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{personalInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{personalInfo.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {personalInfo.notes && (
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Ghi chú</h4>
                      <p className="text-sm text-gray-600">{personalInfo.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Tóm tắt thanh toán</h3>
                
                <div className="space-y-4">
                  {/* Payment Status */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-green-800">Thanh toán thành công</div>
                        <div className="text-sm text-green-600">Online Banking - Vietcombank</div>
                      </div>
                    </div>
                    <p className="text-sm text-green-700">
                      Giao dịch đã được xử lý thành công. Bạn sẽ nhận được email xác nhận trong vài phút tới.
                    </p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Giá cơ bản</span>
                      <span className="font-semibold">{formatPrice(basePrice)}</span>
                    </div>
                    {selectedTimeSlot && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Hệ số {getTimeTypeText()}</span>
                        <span className="font-semibold text-blue-600">+{formatPrice(totalPrice - basePrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phí dịch vụ</span>
                      <span className="font-semibold">{formatPrice(50000)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Thuế VAT (10%)</span>
                      <span className="font-semibold">{formatPrice((totalPrice + 50000) * 0.1)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Tổng đã thanh toán</span>
                        <span className="text-green-600">{formatPrice((totalPrice + 50000) * 1.1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Bước tiếp theo</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                        <span>Kiểm tra email xác nhận</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                        <span>Đến sân đúng giờ đã đặt</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                        <span>Liên hệ quản lý sân nếu cần hỗ trợ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-6">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                In hóa đơn
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đặt sân</h1>
            <p className="text-sm text-gray-600">Đặt sân dễ dàng và nhanh chóng</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-6 border-b border-gray-200 bg-white/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white shadow-lg scale-110' 
                    : 'bg-white text-gray-400 border-2 border-gray-300'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <div className={`text-sm font-semibold transition-colors ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-6 transition-colors ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200 hover:shadow-sm'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-all hover:shadow-sm"
            >
              Hủy
            </button>
            {currentStep === 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
              >
                Thanh toán
                <CreditCard className="w-4 h-4" />
              </button>
            ) : currentStep === 2 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Hoàn tất
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
              >
                Hoàn tất đặt sân
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
