import React from 'react';
import { useAuth } from '../../pages/Authen/AuthContext';
import FieldInfo from './FieldInfo';
import OrderSummary from './OrderSummary';

const Step1Content = ({
  field,
  selectedBookingDate,
  setSelectedBookingDate,
  availableTimeSlots,
  selectedTimeSlotId,
  setSelectedTimeSlotId,
  timeSlot,
  bookingNotes,
  setBookingNotes,
  currentImageIndex,
  setCurrentImageIndex,
  getCurrentImage,
  getTimeTypeText,
  basePrice,
  totalPrice
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Chọn ngày & giờ</h1>
        <p className="text-gray-600 text-base">Chọn ngày và khung giờ phù hợp cho buổi chơi của bạn</p>
      </div>

      {/* Booking Form - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - Date/Time + Personal Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-5">Thông tin đặt sân</h3>
          <div className="space-y-5">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn ngày *</label>
              <input
                type="date"
                value={selectedBookingDate}
                onChange={(e) => setSelectedBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Chọn khung giờ *</label>
              {availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ 
                  transform: 'none !important',
                  scale: '1 !important',
                  zoom: '1 !important'
                }}>
                  {availableTimeSlots.map((slot) => (
                    <button
                      key={slot._id}
                      onClick={() => setSelectedTimeSlotId(slot._id)}
                      className={`p-4 rounded-xl border-2 text-left focus:outline-none focus:ring-0 active:transform-none ${
                        selectedTimeSlotId === slot._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                      style={{ 
                        transform: 'none !important', 
                        transition: 'none !important',
                        scale: '1 !important',
                        zoom: '1 !important',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-base text-gray-900 mb-1">
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">
                              {slot.multiplier > 1 ? `+${Math.round((slot.multiplier - 1) * 100)}%` : 'Giá gốc'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <div className="text-lg font-bold text-blue-600">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(basePrice * slot.multiplier)}
                          </div>
                        </div>
                      </div>
                      {selectedTimeSlotId === slot._id && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Đã chọn
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm">Không có khung giờ khả dụng</p>
                  <p className="text-xs text-gray-400 mt-1">Vui lòng chọn ngày khác</p>
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="border-t pt-5">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin người đặt</h4>
              
              {/* User Avatar & Basic Info */}
              <div className="flex items-center gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user?.name} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{user?.name || 'Chưa có thông tin'}</div>
                  <div className="text-xs text-gray-600 truncate">{user?.email || 'Chưa có thông tin'}</div>
                  <div className="text-xs text-gray-500">
                    {user?.phone_number || 'Chưa có thông tin'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                    <textarea
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="Nhập ghi chú cho buổi chơi (tùy chọn)"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
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
          />
        </div>
      </div>
    </div>
  );
};

export default Step1Content;
