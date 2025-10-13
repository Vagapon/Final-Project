import axiosClient from '../axiosClient';

const fieldApi = {
  // Lấy danh sách tất cả sân bóng
  getAllFields: () => {
    return axiosClient.get('/fields');
  },

  // Lấy chi tiết sân bóng theo ID
  getFieldById: (id) => {
    return axiosClient.get(`/fields/${id}`);
  },

  // Tạo sân bóng mới
  createField: (formData) => {
    return axiosClient.post('/fields', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Cập nhật sân bóng
  updateField: (id, formData) => {
    return axiosClient.put(`/fields/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Xóa sân bóng
  deleteField: (id) => {
    return axiosClient.delete(`/fields/${id}`);
  },

  // Lấy khung giờ của sân bóng
  getFieldTimeSlots: (fieldId) => {
    return axiosClient.get(`/fields/${fieldId}/time-slots`);
  },

  // Cập nhật khung giờ của sân bóng
  updateFieldTimeSlots: (fieldId, timeSlots) => {
    return axiosClient.put(`/fields/${fieldId}/time-slots`, timeSlots);
  },

  // Lấy booking của sân bóng
  getFieldBookings: (fieldId, params = {}) => {
    return axiosClient.get(`/fields/${fieldId}/bookings`, { params });
  },

  // Lấy thống kê sân bóng
  getFieldStats: (fieldId) => {
    return axiosClient.get(`/fields/${fieldId}/stats`);
  }
};

export default fieldApi;
