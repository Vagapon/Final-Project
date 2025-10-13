import React from 'react';
import { X, Loader2 } from 'lucide-react';

const BookingModal = ({
  isOpen,
  onClose,
  field,
  timeSlots,
  selectedTimeSlot,
  setSelectedTimeSlot,
  selectedDate,
  setSelectedDate,
  bookingNotes,
  setBookingNotes,
  onBooking,
  formatPrice
}) => {
  if (!isOpen || !field) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Đặt sân {field.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Field Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900">{field.name}</h3>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Thời gian: 90 phút</span>
              <span className="font-semibold text-gray-900">{formatPrice(field.pricePerHour)}/khung giờ</span>
            </div>
            {selectedTimeSlot && (
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Khung giờ: {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {selectedTimeSlot.timeType === 'ca_sang' ? 'Sáng (x1.0)' : 
                     selectedTimeSlot.timeType === 'ca_chieu' ? 'Chiều (x1.2)' : 
                     selectedTimeSlot.timeType === 'ca_toi' ? 'Tối (x1.5)' : 'Khác'}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Tổng cộng: <span className="font-semibold">
                    {formatPrice(field.pricePerHour * (selectedTimeSlot.multiplier || 
                      (selectedTimeSlot.timeType === 'ca_sang' ? 1.0 :
                       selectedTimeSlot.timeType === 'ca_chieu' ? 1.2 :
                       selectedTimeSlot.timeType === 'ca_toi' ? 1.5 : 1.0)))}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn ngày</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn khung giờ</label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot._id}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    selectedTimeSlot?._id === slot._id
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {slot.startTime} - {slot.endTime}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
            <textarea
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              placeholder="Nhập ghi chú cho đơn đặt sân..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {selectedTimeSlot && selectedDate && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Thông tin đặt sân</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Sân:</strong> {field.name}</p>
                <p><strong>Ngày:</strong> {new Date(selectedDate).toLocaleDateString('vi-VN')}</p>
                <p><strong>Giờ:</strong> {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</p>
                <p><strong>Giá:</strong> {formatPrice(field.pricePerHour)}/giờ</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Hủy
          </button>
          <button
            onClick={onBooking}
            disabled={!selectedTimeSlot || !selectedDate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Xác nhận đặt sân
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
