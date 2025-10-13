import React from 'react';
import { Check, Calendar, Clock, MapPin, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

const Step3Content = ({ 
  field, 
  timeSlot, 
  selectedBookingDate, 
  basePrice, 
  totalPrice, 
  bookingNotes, 
  user, 
  getTimeTypeText 
}) => {
  if (!field) return null;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Đặt sân thành công!</h1>
        <p className="text-gray-600 text-base">Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Booking Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-5">Chi tiết đặt sân</h3>
          
          {/* Booking ID */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-blue-800">Mã đặt sân</div>
                <div className="text-sm text-blue-600 font-mono">#{Date.now().toString().slice(-8)}</div>
              </div>
            </div>
          </div>

          {/* Field Info */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={field.images?.[0] || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=400&fit=crop&crop=center'}
                alt={field.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-lg">{field.name}</div>
              <div className="text-sm text-gray-600">{field.location}</div>
              <div className="text-sm text-gray-500">
                {selectedBookingDate} - {timeSlot?.startTime} đến {timeSlot?.endTime}
                {timeSlot?.timeType && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Ca {getTimeTypeText(timeSlot.timeType)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Thông tin liên hệ</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span>{user?.name || 'Chưa có thông tin'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{user?.email || 'Chưa có thông tin'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{user?.phone_number || 'Chưa có thông tin'}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {bookingNotes && (
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-2">Ghi chú</h4>
              <p className="text-sm text-gray-600">{bookingNotes}</p>
            </div>
          )}
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

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">Bước tiếp theo</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Kiểm tra email xác nhận đặt sân</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Đến sân đúng giờ đã đặt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Liên hệ hotline nếu cần hỗ trợ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Content;
