// Base API Client - Common API functionality
import axiosClient from '../axiosClient';

class BaseApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // Generic GET request
  async get(endpoint, params = {}) {
    const response = await axiosClient.get(`${this.baseUrl}${endpoint}`, { params });
    return response;
  }

  // Generic POST request
  async post(endpoint, data = {}) {
    const response = await axiosClient.post(`${this.baseUrl}${endpoint}`, data);
    return response;
  }

  // Generic PUT request
  async put(endpoint, data = {}) {
    const response = await axiosClient.put(`${this.baseUrl}${endpoint}`, data);
    return response;
  }

  // Generic PATCH request
  async patch(endpoint, data = {}) {
    const response = await axiosClient.patch(`${this.baseUrl}${endpoint}`, data);
    return response;
  }

  // Generic DELETE request
  async delete(endpoint) {
    const response = await axiosClient.delete(`${this.baseUrl}${endpoint}`);
    return response;
  }

  // Upload file
  async upload(endpoint, formData) {
    const response = await axiosClient.post(`${this.baseUrl}${endpoint}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  }
}

export default BaseApiClient;
