import paymentApi from './paymentApi';

class PaymentService {
  /**
   * Tạo QR thanh toán
   */
  async generateQRCode(bookingId) {
    try {
      const result = await paymentApi.createPaymentQR(bookingId);
      
      if (result.success) {
        return {
          success: true,
          data: {
            qrUrl: result.qrUrl,
            description: result.description,
            total: result.total,
            bookingId: result.bookingId
          }
        };
      }
      
      return {
        success: false,
        error: 'Failed to generate QR code'
      };
    } catch (error) {
      console.error('Error generating QR:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate QR code'
      };
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán
   */
  async getPaymentStatus(bookingId) {
    try {
      const result = await paymentApi.checkPaymentStatus(bookingId);
      
      if (result.success) {
        return {
          success: true,
          data: {
            paymentStatus: result.paymentStatus,
            status: result.status,
            totalPrice: result.totalPrice,
            paymentMethod: result.paymentMethod
          }
        };
      }
      
      return {
        success: false,
        error: 'Failed to get payment status'
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return {
        success: false,
        error: error.message || 'Failed to check payment status'
      };
    }
  }

  /**
   * Poll payment status với interval
   * @param {string} bookingId 
   * @param {Function} onStatusChange - Callback khi status thay đổi
   * @param {number} interval - Thời gian poll (ms), default 3000
   * @returns {Function} cleanup function để stop polling
   */
  startPollingPaymentStatus(bookingId, onStatusChange, interval = 3000) {
    const pollInterval = setInterval(async () => {
      const result = await this.getPaymentStatus(bookingId);
      
      if (result.success) {
        onStatusChange(result.data);
        
        // Stop polling nếu đã thanh toán thành công
        if (result.data.paymentStatus === 'paid') {
          clearInterval(pollInterval);
        }
      }
    }, interval);

    // Return cleanup function
    return () => clearInterval(pollInterval);
  }

  /**
   * Format số tiền VNĐ
   */
  formatPrice(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Get payment method display name
   */
  getPaymentMethodName(method) {
    const methods = {
      'sepay_qr': 'QR Code - Chuyển khoản ngân hàng',
      'cash': 'Tiền mặt',
      'momo': 'Ví MoMo',
      'vnpay': 'VNPay',
      'bank_transfer': 'Chuyển khoản ngân hàng'
    };
    
    return methods[method] || method;
  }

  /**
   * Get payment status display info
   */
  getPaymentStatusInfo(status) {
    const statusMap = {
      'unpaid': {
        label: 'Chưa thanh toán',
        color: 'warning',
        icon: '⏳'
      },
      'paid': {
        label: 'Đã thanh toán',
        color: 'success',
        icon: '✅'
      },
      'refunded': {
        label: 'Đã hoàn tiền',
        color: 'info',
        icon: '↩️'
      }
    };
    
    return statusMap[status] || {
      label: status,
      color: 'default',
      icon: '❓'
    };
  }
}

export default new PaymentService();

