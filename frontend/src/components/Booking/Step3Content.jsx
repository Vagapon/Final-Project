import React, { useEffect, useState } from 'react';
import { Check, Calendar, Clock, MapPin, User, Mail, Phone, MessageSquare, Shield, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

const Step3Content = ({ 
  field, 
  timeSlot, 
  selectedBookingDate, 
  basePrice, 
  totalPrice, 
  bookingNotes, 
  user, 
  getTimeTypeText,
  duration 
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Add custom CSS for checkmark animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes drawCheckmark {
        0% {
          stroke-dashoffset: 30;
        }
        100% {
          stroke-dashoffset: 0;
        }
      }
      
      @keyframes checkmarkBounce {
        0% {
          transform: scale(0) rotate(180deg);
        }
        50% {
          transform: scale(1.1) rotate(0deg);
        }
        100% {
          transform: scale(1) rotate(0deg);
        }
      }
      
      .checkmark-animated {
        animation: drawCheckmark 0.8s ease-in-out 0.3s forwards;
      }
      
      .checkmark-container {
        animation: checkmarkBounce 1s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!field) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      {/* Success Header - Animated */}
      <div className="text-center mb-6">
          <div className={`relative inline-block transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            {/* Animated Checkmark */}
            <div className="relative">
              <div className={`w-16 h-16 bg-white border-4 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg checkmark-container ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
                {/* Custom Checkmark SVG */}
                <svg 
                  className="w-8 h-8 text-green-500 checkmark-animated"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ 
                    strokeDasharray: '30',
                    strokeDashoffset: '30'
                  }}
                >
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              
              {/* Ripple Effect */}
              <div className={`absolute inset-0 rounded-full border-4 border-green-300 animate-ping ${showAnimation ? 'opacity-0' : 'opacity-100'}`}></div>
              <div className={`absolute inset-0 rounded-full border-2 border-green-200 animate-ping ${showAnimation ? 'opacity-0' : 'opacity-100'}`} style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          
          <div className={`transition-all duration-1000 delay-500 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">Booking Successful!</h1>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto">
              Thank you for trusting our service. Your booking has been confirmed!
            </p>
          </div>
        </div>

      {/* Booking Details */}
      <div className={`transition-all duration-1000 delay-700 ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <h3 className="text-base font-bold text-slate-800 mb-3">Booking Details</h3>
              
              {/* Booking ID */}
              <div className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-green-800 text-sm">Booking ID</div>
                    <div className="text-sm text-green-600 font-mono">#{Date.now().toString().slice(-8)}</div>
                  </div>
                </div>
              </div>

              {/* Field Info */}
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={field.images?.[0] || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=400&fit=crop&crop=center'}
                      alt={field.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 text-base">{field.name}</div>
                    <div className="text-sm text-slate-600">{field.location}</div>
                    <div className="text-xs text-slate-500">
                      {selectedBookingDate} - {timeSlot?.startTime} to {timeSlot?.endTime}
                      {timeSlot?.timeType && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                          {getTimeTypeText(timeSlot.timeType)} Slot
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-slate-800 mb-3 text-sm">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{user?.name || 'No information'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{user?.email || 'No information'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{user?.phone_number || 'No information'}</span>
                  </div>
                </div>
              </div>

        {/* Notes */}
        {bookingNotes && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h4 className="font-bold text-slate-800 mb-2 text-sm">Notes</h4>
            <p className="text-sm text-slate-600">{bookingNotes}</p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
          <h4 className="font-bold text-slate-800 mb-3 text-sm">Next Steps</h4>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Check your email for booking confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Arrive at the field on time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Contact hotline if you need support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Content;
