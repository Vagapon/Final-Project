import axiosClient from '../axiosClient';

const userApi = {
  // Lấy danh sách tất cả user
  getAllUsers: (params = {}) => {
    return axiosClient.get('/user', { params });
  },

  // Lấy chi tiết user theo ID
  getUserById: (id) => {
    return axiosClient.get(`/user/${id}`);
  },

  // Tạo user mới
  createUser: (userData) => {
    return axiosClient.post('/user', userData);
  },

  // Cập nhật user
  updateUser: (id, userData) => {
    return axiosClient.put(`/user/${id}`, userData);
  },

  // Xóa user
  deleteUser: (id) => {
    return axiosClient.delete(`/user/${id}`);
  },

  // Cập nhật trạng thái user (active/inactive)
  updateUserStatus: (id, status) => {
    return axiosClient.put(`/user/${id}/status`, { isActive: status });
  },

  // Lấy thống kê user
  getUserStats: () => {
    return axiosClient.get('/user/stats');
  },

  // Tìm kiếm user
  searchUsers: (query) => {
    return axiosClient.get('/user/search', { params: { q: query } });
  }
};

export default userApi;
