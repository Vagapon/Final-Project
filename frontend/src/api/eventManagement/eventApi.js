import axiosClient from '../axiosClient';

const eventApi = {
  // Lấy danh sách tất cả event
  getAllEvents: (params = {}) => {
    return axiosClient.get('/event', { params });
  },

  // Lấy chi tiết event theo ID
  getEventById: (id) => {
    return axiosClient.get(`/event/${id}`);
  },

  // Tạo event mới
  createEvent: (eventData) => {
    return axiosClient.post('/event', eventData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Cập nhật event
  updateEvent: (id, eventData) => {
    return axiosClient.put(`/event/${id}`, eventData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Xóa event
  deleteEvent: (id) => {
    return axiosClient.delete(`/event/${id}`);
  },

  // Đăng ký tham gia event
  registerEvent: (eventId, registrationData) => {
    return axiosClient.post(`/event/${eventId}/register`, registrationData);
  },

  // Hủy đăng ký event
  unregisterEvent: (eventId, registrationId) => {
    return axiosClient.delete(`/event/${eventId}/register/${registrationId}`);
  },

  // Lấy danh sách đăng ký của event
  getEventRegistrations: (eventId) => {
    return axiosClient.get(`/event/${eventId}/registrations`);
  },

  // Lấy thống kê event
  getEventStats: (eventId) => {
    return axiosClient.get(`/event/${eventId}/stats`);
  },

  // Tìm kiếm event
  searchEvents: (query) => {
    return axiosClient.get('/event/search', { params: { q: query } });
  },

  // Lấy event theo loại
  getEventsByType: (type) => {
    return axiosClient.get('/event/type', { params: { type } });
  },

  // Cập nhật trạng thái event
  updateEventStatus: (id, status) => {
    return axiosClient.put(`/event/${id}/status`, { status });
  }
};

export default eventApi;
