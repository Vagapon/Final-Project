import React, { useState, useEffect } from 'react';
import { useAuth } from '../../pages/Authen/AuthContext';
import { fieldBookingService } from '../../api';

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
  totalPrice,
  duration,
  validationError,
  setValidationError
}) => {
  const { user } = useAuth();
  const [bookedSlots, setBookedSlots] = useState(new Set());
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Check booked slots when date or field changes
  useEffect(() => {
    if (field && selectedBookingDate && availableTimeSlots.length > 0) {
      checkBookedSlots();
    }
  }, [field, selectedBookingDate, availableTimeSlots]);

  const checkBookedSlots = async () => {
    try {
      setCheckingAvailability(true);
      const booked = new Set();
      
      // Check availability for each time slot
      for (const slot of availableTimeSlots) {
        try {
          const isAvailable = await fieldBookingService.checkAvailability(
            field._id,
            selectedBookingDate,
            slot._id
          );
          
          if (!isAvailable) {
            booked.add(slot._id);
          }
        } catch (error) {
          console.error(`Error checking slot ${slot._id}:`, error);
        }
      }
      
      setBookedSlots(booked);
    } catch (error) {
      console.error('Error checking booked slots:', error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleTimeSlotClick = (slot) => {
    // Clear validation error when selecting a time slot
    if (setValidationError) {
      setValidationError('');
    }
    
    // Check if slot is booked
    if (bookedSlots.has(slot._id)) {
      return; // Don't allow selecting booked slots
    }
    
    setSelectedTimeSlotId(slot._id);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">Thông tin đặt sân</h3>
          <div className="space-y-3">
            {/* Date Selection & Legend - Horizontal */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end justify-between">
              {/* Date Selection - Left */}
              <div className="w-full md:w-auto md:flex-1 md:max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Chọn ngày *</label>
                <input
                  type="date"
                  value={selectedBookingDate}
                  onChange={(e) => setSelectedBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Legend - Right */}
              <div className="px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2.5 text-sm whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-gray-200 bg-white rounded"></div>
                    <span className="text-gray-600">Khả dụng</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-blue-500 bg-blue-50 rounded"></div>
                    <span className="text-gray-600">Đã chọn</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-red-200 bg-red-50 rounded opacity-70"></div>
                    <span className="text-gray-600">Đã đặt</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Slot Selection */}
            <div data-section="timeslot">
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn khung giờ *</label>
              
              {/* Validation Error Message */}
              {validationError && (
                <div className="mb-2 p-2 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-1.5 animate-pulse">
                  <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">{validationError}</p>
                  </div>
                </div>
              )}

              {checkingAvailability && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1.5">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-blue-700">Đang kiểm tra khung giờ khả dụng...</p>
                </div>
              )}

              {availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2" style={{ 
                  transform: 'none !important',
                  scale: '1 !important',
                  zoom: '1 !important'
                }}>
                  {availableTimeSlots.map((slot) => {
                    const isBooked = bookedSlots.has(slot._id);
                    const isSelected = selectedTimeSlotId === slot._id;
                    
                    return (
                      <button
                        key={slot._id}
                        onClick={() => handleTimeSlotClick(slot)}
                        disabled={isBooked}
                        className={`p-2.5 rounded-lg border-2 text-left focus:outline-none focus:ring-0 active:transform-none relative transition-all ${
                          isBooked
                            ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-70'
                            : isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                        }`}
                        style={{ 
                          transform: 'none !important', 
                          transition: isBooked ? 'none !important' : 'all 0.2s ease',
                          scale: '1 !important',
                          zoom: '1 !important',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* Booked Badge */}
                        {isBooked && (
                          <div className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <div className={`font-bold text-sm mb-0.5 ${isBooked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <span className={`text-xs ${isBooked ? 'text-gray-400' : 'text-gray-600'}`}>
                              {slot.multiplier > 1 ? `+${Math.round((slot.multiplier - 1) * 100)}%` : 'Giá gốc'}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className={`text-base font-bold ${isBooked ? 'text-gray-400 line-through' : 'text-blue-600'}`}>
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(basePrice * slot.multiplier)}
                            </div>
                          </div>
                        </div>
                        
                        {isSelected && !isBooked && (
                          <div className="mt-1.5 pt-1.5 border-t border-blue-200">
                            <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Đã chọn
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm">Không có khung giờ khả dụng</p>
                  <p className="text-sm text-gray-400 mt-0.5">Vui lòng chọn ngày khác</p>
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="border-t pt-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Thông tin người đặt</h4>
              
              {/* User Avatar & Basic Info */}
              <div className="flex items-center gap-2.5 mb-2 p-2.5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user?.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{user?.name || 'Chưa có thông tin'}</div>
                  <div className="text-sm text-gray-600 truncate">{user?.email || 'Chưa có thông tin'}</div>
                  <div className="text-sm text-gray-500">
                    {user?.phone_number || 'Chưa có thông tin'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Nhập ghi chú cho buổi chơi (tùy chọn)"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>
    </div>
  );
};

export default Step1Content;
