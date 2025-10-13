import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingHeader = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đặt sân? Thông tin đã nhập sẽ bị mất.')) {
      navigate('/book');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Đặt sân</h1>
              <p className="text-sm text-gray-600">Đặt sân dễ dàng và nhanh chóng</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-medium transition-all border border-gray-300 hover:border-red-300"
          >
            Hủy đặt sân
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingHeader;
