import axiosClient from '../axiosClient';

const seasonApi = {
  // Lấy danh sách tất cả season
  getAllSeasons: (params = {}) => {
    return axiosClient.get('/season', { params });
  },

  // Lấy chi tiết season theo ID
  getSeasonById: (id) => {
    return axiosClient.get(`/season/${id}`);
  },

  // Tạo season mới
  createSeason: (seasonData) => {
    return axiosClient.post('/season', seasonData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Cập nhật season
  updateSeason: (id, seasonData) => {
    return axiosClient.put(`/season/${id}`, seasonData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Xóa season
  deleteSeason: (id) => {
    return axiosClient.delete(`/season/${id}`);
  },

  // Lấy thống kê season
  getSeasonStats: (id) => {
    return axiosClient.get(`/season/${id}/stats`);
  },

  // Tìm kiếm season
  searchSeasons: (query) => {
    return axiosClient.get('/season/search', { params: { q: query } });
  },

  // Cập nhật trạng thái season
  updateSeasonStatus: (id, status) => {
    return axiosClient.put(`/season/${id}/status`, { status });
  }
};

export default seasonApi;
