import React, { useState, useEffect } from 'react';
import { Check, QrCode, Loader2 } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

const Step2Content = ({ field, timeSlot, selectedBookingDate, basePrice, totalPrice, getTimeTypeText, user, qrData, paymentStatus, bookingId, onTimeout, duration }) => {
  const [countdown, setCountdown] = useState(900); // 15 phút = 900 giây
  const [isExpired, setIsExpired] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0 || paymentStatus === 'paid') return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, paymentStatus]);

  // Handle timeout
  useEffect(() => {
    if (isExpired && paymentStatus !== 'paid') {
      // Notify parent component
      onTimeout && onTimeout();
    }
  }, [isExpired, paymentStatus, onTimeout]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!field) return null;

  // Validate bookingId và qrData
  if (!bookingId || !qrData || !qrData.qrUrl) {
    return (
      <div className="bg-white rounded-lg border border-red-200 shadow-sm p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Error</h3>
        <p className="text-gray-600 mb-4">Unable to create payment QR code. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <div className="text-center mb-3">
              <h3 className="text-base font-bold text-slate-800 mb-1">Mã QR thanh toán</h3>
              <p className="text-xs text-slate-600">Quét mã QR bằng ứng dụng ngân hàng</p>
            </div>
            
            {paymentStatus === 'paid' ? (
              <div className="text-center">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">Payment Successful!</h4>
                <p className="text-xs text-slate-600 mb-2">
                  Giao dịch đã được xử lý. Đang chuyển đến trang xác nhận...
                </p>
                <div className="bg-slate-50 rounded-md p-2">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-slate-600" />
                    <span className="text-slate-700 text-xs font-medium">Đang xử lý...</span>
                  </div>
                </div>
              </div>
            ) : isExpired ? (
              <div className="text-center">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">Hết thời gian thanh toán</h4>
                <p className="text-xs text-slate-600 mb-2">
                  Mã QR đã hết hạn. Booking của bạn đã bị hủy.
                </p>
                <div className="bg-red-50 rounded-md p-2 border border-red-200">
                  <p className="text-xs text-red-700">
                    Bạn sẽ được chuyển về trang chọn sân để đặt lại...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* QR Code & Info - Horizontal Layout */}
                {qrData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: QR Code */}
                    <div className="flex items-center justify-center">
                      <div className="relative inline-block">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                          <img 
                            src={qrData.qrUrl} 
                            alt="QR Payment" 
                            className="w-56 h-56"
                          />
                          {/* Heart icon overlay */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Payment Info */}
                    <div className="space-y-2.5">
                      {/* Payment Amount & Timer */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Payment Amount */}
                        <div className="bg-slate-50 rounded-md p-3">
                          <div className="text-xs text-slate-600 mb-1">Số tiền thanh toán</div>
                          <div className="text-xl font-bold text-slate-800">
                            {formatPrice(qrData.total)}
                          </div>
                        </div>
                        
                        {/* Countdown Timer */}
                        <div className="bg-blue-600 rounded-md p-3">
                          <div className="text-xs text-blue-100 mb-1">Thời gian còn lại</div>
                          <div className={`text-xl font-bold ${countdown < 60 ? 'text-red-200' : 'text-white'}`}>
                            {formatCountdown(countdown)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Transfer Content & Bank Info */}
                      <div className="bg-slate-50 rounded-md p-3">
                        <div className="text-xs text-slate-600 mb-2">Transfer Information</div>
                        
                        {/* Bank Details */}
                        <div className="space-y-1.5 mb-2 pb-2 border-b border-slate-200">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-600">Ngân hàng:</span>
                            <span className="text-xs font-semibold text-slate-800">MB Bank</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-600">Số tài khoản:</span>
                            <span className="text-xs font-mono font-bold text-slate-800">VQRQAETEP9929</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-600">Chủ TK:</span>
                            <span className="text-xs font-semibold text-slate-800">TRAN TIEN VAN</span>
                          </div>
                        </div>
                        
                        {/* Transfer Description */}
                        <div className="mb-2">
                          <div className="text-xs text-slate-600 mb-1">Nội dung:</div>
                          <div className="text-sm font-mono font-bold text-slate-800 break-all">
                            {qrData.description}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Please enter the exact content</span>
                        </div>
                      </div>

                      {/* Status Indicator */}
                      <div className="bg-slate-50 rounded-md p-3">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                          <span className="text-slate-800 font-semibold text-sm">Đang chờ thanh toán...</span>
                        </div>
                        <p className="text-xs text-slate-600 text-center">
                          Hệ thống sẽ tự động xác nhận khi nhận được tiền
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-6 flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-600 mb-2" />
                    <span className="text-slate-600 text-xs font-medium">Đang tạo mã QR...</span>
                  </div>
                )}

                {/* Payment Instructions - Full Width */}
                <div className="bg-slate-50 rounded-md p-3">
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5 text-sm">
                    <QrCode className="w-4 h-4" />
                    Hướng dẫn thanh toán
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { step: 1, text: "Mở app ngân hàng và quét mã QR" },
                      { step: 2, text: "Kiểm tra số tiền và nội dung chuyển khoản" },
                      { step: 3, text: "Xác nhận thanh toán" },
                      { step: 4, text: "Chờ hệ thống xác nhận tự động (3-5 giây)" }
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-blue-600 text-white rounded-sm flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {item.step}
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-tight">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
    </div>
  );
};

export default Step2Content;
