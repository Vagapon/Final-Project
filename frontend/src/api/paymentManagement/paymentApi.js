import BaseApiClient from '../base/BaseApiClient';

class PaymentApi extends BaseApiClient {
  constructor() {
    super('/payments');
  }

  /**
   * Tạo QR code thanh toán cho booking
   * @param {string} bookingId - ID của booking
   * @returns {Promise} QR data
   */
  async createPaymentQR(bookingId) {
    try {
      const response = await this.client.get(`/qr/${bookingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán
   * @param {string} bookingId - ID của booking
   * @returns {Promise} Payment status
   */
  async checkPaymentStatus(bookingId) {
    try {
      const response = await this.client.get(`/status/${bookingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Webhook handler (chỉ dùng cho testing)
   * Trong production, webhook sẽ được gọi trực tiếp từ SePay server
   */
  async simulateWebhook(webhookData) {
    try {
      const response = await this.client.post('/webhook', webhookData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default new PaymentApi();

