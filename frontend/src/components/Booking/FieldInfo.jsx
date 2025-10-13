import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FieldInfo = ({ 
  field, 
  selectedBookingDate, 
  timeSlot, 
  currentImageIndex, 
  setCurrentImageIndex,
  getCurrentImage,
  getTimeTypeText 
}) => {
  const images = field?.images || [];
  
  const handlePreviousImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  if (!field) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-5">Thông tin sân</h3>
      
      {/* Field Image Carousel */}
      <div className="relative mb-4">
        <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
          <img
            src={getCurrentImage()}
            alt={field.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {images.length > 1 && (
          <>
            <button
              onClick={handlePreviousImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Field Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={getCurrentImage()}
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
      </div>
    </div>
  );
};

export default FieldInfo;
