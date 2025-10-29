import { useState, useEffect } from 'react';
import { paymentService } from '../../api/paymentManagement';

/**
 * Modal hiển thị QR Code thanh toán
 */
export default function PaymentQRModal({ bookingId, onSuccess, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(900); // 15 phút

  // Load QR code
  useEffect(() => {
    const loadQRCode = async () => {
      setLoading(true);
      const result = await paymentService.generateQRCode(bookingId);
      
      if (result.success) {
        setQrData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      
      setLoading(false);
    };

    loadQRCode();
  }, [bookingId]);

  // Poll payment status
  useEffect(() => {
    if (!qrData) return;

    const cleanup = paymentService.startPollingPaymentStatus(
      bookingId,
      (statusData) => {
        setPaymentStatus(statusData.paymentStatus);
        
        if (statusData.paymentStatus === 'paid') {
          onSuccess && onSuccess(statusData);
        }
      },
      3000 // Poll mỗi 3 giây
    );

    return cleanup;
  }, [bookingId, qrData, onSuccess]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0 || paymentStatus === 'paid') return;

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, paymentStatus]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-spinner">Đang tạo mã QR...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="error-message">
            <p>❌ {error}</p>
            <button onClick={onClose} className="btn-close">Đóng</button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'paid') {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="success-message">
            <h2>✅ Thanh toán thành công!</h2>
            <p>Booking của bạn đã được xác nhận.</p>
            <button onClick={onClose} className="btn-primary">Hoàn tất</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="payment-qr-container">
          <button onClick={onClose} className="btn-close-icon">✕</button>
          
          <h2 className="text-2xl font-bold mb-4">Thanh toán đặt sân</h2>
          
          <div className="qr-section">
            <img 
              src={qrData.qrUrl} 
              alt="QR Payment" 
              className="qr-image"
            />
          </div>

          <div className="payment-info">
            <div className="info-row">
              <span className="label">Số tiền:</span>
              <span className="value font-bold text-xl text-green-600">
                {paymentService.formatPrice(qrData.total)}
              </span>
            </div>
            
            <div className="info-row">
              <span className="label">Nội dung chuyển khoản:</span>
              <span className="value font-mono font-bold text-blue-600">
                {qrData.description}
              </span>
            </div>

            <div className="info-row">
              <span className="label">Thời gian còn lại:</span>
              <span className={`value font-bold ${countdown < 60 ? 'text-red-600' : 'text-gray-700'}`}>
                {formatCountdown(countdown)}
              </span>
            </div>
          </div>

          <div className="instructions">
            <h3 className="font-semibold mb-2">Hướng dẫn thanh toán:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Mở app ngân hàng và quét mã QR</li>
              <li>Kiểm tra số tiền và nội dung chuyển khoản</li>
              <li>Xác nhận thanh toán</li>
              <li>Chờ hệ thống xác nhận (tự động)</li>
            </ol>
          </div>

          <div className="status-indicator">
            <div className="loading-dots">
              <span>Đang chờ thanh toán</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

