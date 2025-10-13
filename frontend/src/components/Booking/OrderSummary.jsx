import React from 'react';
import { formatPrice } from '../../utils/formatPrice';

const OrderSummary = ({ 
  field, 
  timeSlot, 
  selectedBookingDate, 
  basePrice, 
  totalPrice, 
  getTimeTypeText,
  user
}) => {
  if (!field) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-5">Tóm tắt đơn hàng</h3>
      
      {/* Field Info */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={field.images?.[0] || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=400&fit=crop&crop=center'}
            alt={field.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">{field.name}</div>
          <div className="text-xs text-gray-600 truncate">{field.location}</div>
          <div className="text-xs text-gray-500">
            {selectedBookingDate} - {timeSlot?.startTime} đến {timeSlot?.endTime}
            {timeSlot?.timeType && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                Ca {getTimeTypeText(timeSlot.timeType)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600">Giá cơ bản</span>
          <span className="font-semibold text-sm">{formatPrice(basePrice)}</span>
        </div>
        {timeSlot && (
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">Phí dịch vụ (Ca {getTimeTypeText(timeSlot.timeType)}) - Hệ số {timeSlot.multiplier}x</span>
            <span className="font-semibold text-blue-600 text-sm">+{formatPrice(totalPrice - basePrice)}</span>
          </div>
        )}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Tổng cộng</span>
            <span className="text-blue-600">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-blue-50 rounded-xl p-4 mt-4">
        <h4 className="font-semibold text-gray-900 mb-2">Thông tin liên hệ</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div>Người đặt: {user?.name || 'Chưa có thông tin'}</div>
          <div>Email: {user?.email || 'Chưa có thông tin'}</div>
          <div>SĐT: {user?.phone_number || 'Chưa có thông tin'}</div>
        </div>
      </div>

      {/* Payment Security Notice */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-200 mt-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-green-800 text-sm">Bảo mật thanh toán</h4>
            <p className="text-xs text-green-700 mt-1">
              Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
