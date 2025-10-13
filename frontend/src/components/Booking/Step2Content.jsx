import React from 'react';
import { CreditCard, Shield, Check } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

const Step2Content = ({ field, timeSlot, selectedBookingDate, basePrice, totalPrice, getTimeTypeText, user }) => {
  if (!field) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Thanh toán</h1>
        <p className="text-gray-600 text-base">Chọn phương thức thanh toán phù hợp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-5">Phương thức thanh toán</h3>
          
          <div className="space-y-4">
            {/* Online Banking */}
            <div className="border-2 border-blue-500 bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Online Banking</h4>
                  <p className="text-sm text-blue-700">Thanh toán qua ngân hàng</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Check className="w-4 h-4" />
                  <span>Vietcombank - 1234567890</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Check className="w-4 h-4" />
                  <span>Techcombank - 0987654321</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Check className="w-4 h-4" />
                  <span>BIDV - 1122334455</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 text-sm">Bảo mật tuyệt đối</h4>
                  <p className="text-xs text-green-700 mt-1">
                    Thông tin thanh toán được mã hóa SSL 256-bit. Chúng tôi không lưu trữ thông tin thẻ của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
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
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Giá cơ bản</span>
              <span className="font-semibold">{formatPrice(basePrice)}</span>
            </div>
            {timeSlot && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phí dịch vụ (Ca {getTimeTypeText(timeSlot.timeType)}) - Hệ số {timeSlot.multiplier}x</span>
                <span className="font-semibold text-blue-600">+{formatPrice(totalPrice - basePrice)}</span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Tổng đã thanh toán</span>
                <span className="text-green-600">{formatPrice(totalPrice)}</span>
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
      </div>
    </div>
  );
};

export default Step2Content;
