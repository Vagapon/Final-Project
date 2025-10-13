// Base Service - Common functionality for all services
import { message } from 'antd';

class BaseService {
  constructor(apiClient) {
    this.api = apiClient;
  }

  // Generic API call handler
  async makeRequest(apiMethod, ...args) {
    try {
      const response = await apiMethod.apply(this.api, args);
      return this.handleSuccess(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Handle successful responses
  handleSuccess(response) {
    // Backend already returns standardized format: { success: true, data: ... }
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message
    };
  }

  // Handle errors consistently
  handleError(error) {
    console.error('API Error:', error);
    
    const errorData = error.response?.data || error;
    const errorMessage = errorData.message || 'Có lỗi xảy ra';
    
    return {
      success: false,
      message: errorMessage,
      errors: errorData.errors || null,
      statusCode: error.response?.status
    };
  }

  // Show success message
  showSuccess(msg) {
    message.success(msg);
  }

  // Show error message
  showError(msg) {
    message.error(msg);
  }

  // Show warning message
  showWarning(msg) {
    message.warning(msg);
  }

  // Show info message
  showInfo(msg) {
    message.info(msg);
  }

  // Generic CRUD operations
  async getAll(params = {}) {
    return this.makeRequest(this.api.getAll, params);
  }

  async getById(id) {
    return this.makeRequest(this.api.getById, id);
  }

  async create(data) {
    return this.makeRequest(this.api.create, data);
  }

  async update(id, data) {
    return this.makeRequest(this.api.update, id, data);
  }

  async delete(id) {
    return this.makeRequest(this.api.delete, id);
  }

  // Utility methods
  formatDate(date) {
    if (!date) return null;
    return new Date(date).toLocaleDateString('vi-VN');
  }

  formatDateTime(date) {
    if (!date) return null;
    return new Date(date).toLocaleString('vi-VN');
  }

  formatCurrency(amount) {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
}

export default BaseService;
