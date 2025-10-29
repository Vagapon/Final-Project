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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
      <h3 className="text-sm font-bold text-gray-900 mb-2">Thông tin sân</h3>
      
      {/* Field Image Carousel */}
      <div className="relative mb-2">
        <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
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
              className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Field Details */}
      <div>
        <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
          <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={getCurrentImage()}
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
                {timeSlot.timeType && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {getTimeTypeText(timeSlot.timeType)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldInfo;
