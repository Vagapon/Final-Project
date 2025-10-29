import React from 'react';
import { formatPrice } from '../../utils/formatPrice';

const OrderSummary = ({ 
  field, 
  timeSlot, 
  selectedBookingDate, 
  basePrice, 
  totalPrice, 
  getTimeTypeText,
  user,
  duration
}) => {
  if (!field) return null;

  const multiplierFee = totalPrice - basePrice;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
      <h3 className="text-sm font-bold text-gray-900 mb-2">Tóm tắt đơn hàng</h3>
      
      {/* Field Info */}
      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 mb-2">
        <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={field.images?.[0] || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=400&fit=crop&crop=center'}
            alt={field.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-xs truncate">{field.name}</div>
          <div className="text-xs text-gray-600 truncate">{field.location}</div>
          {timeSlot && (
            <div className="text-xs text-gray-500 mt-0.5">
              {selectedBookingDate} • {timeSlot.startTime} - {timeSlot.endTime}
              {duration && <span className="text-gray-400"> ({duration}h)</span>}
              {timeSlot.timeType && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {getTimeTypeText(timeSlot.timeType)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center py-1">
          <span className="text-xs text-gray-600">Giá cơ bản</span>
          <span className="font-semibold text-xs">{formatPrice(basePrice)}</span>
        </div>
        {timeSlot && timeSlot.multiplier !== 1 && (
          <div className="flex justify-between items-center py-1">
            <div>
              <span className="text-xs text-gray-600">Phí dịch vụ ({getTimeTypeText(timeSlot.timeType)})</span>
              <div className="text-xs text-gray-500">Hệ số {timeSlot.multiplier}x</div>
            </div>
            <span className="font-semibold text-blue-600 text-xs">+{formatPrice(multiplierFee)}</span>
          </div>
        )}
        <div className="border-t pt-1.5">
          <div className="flex justify-between items-center text-sm font-bold">
            <span>Tổng cộng</span>
            <span className="text-blue-600">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-blue-50 rounded-lg p-2 mt-2">
        <h4 className="font-semibold text-gray-900 mb-1 text-xs">Thông tin liên hệ</h4>
        <div className="space-y-0.5 text-xs text-gray-600">
          <div>Người đặt: {user?.name || 'Chưa có thông tin'}</div>
          <div>Email: {user?.email || 'Chưa có thông tin'}</div>
          <div>SĐT: {user?.phone_number || 'Chưa có thông tin'}</div>
        </div>
      </div>

      {/* Payment Security Notice */}
      <div className="bg-green-50 rounded-lg p-2 border border-green-200 mt-2">
        <div className="flex items-start gap-1.5">
          <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-green-800 text-xs">Bảo mật thanh toán</h4>
            <p className="text-xs text-green-700 mt-0.5">
              Thông tin thanh toán được mã hóa và bảo mật tuyệt đối.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
