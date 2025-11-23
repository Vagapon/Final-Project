import axiosClient from '../axiosClient';

const rankingApi = {
  // Lấy tất cả bảng xếp hạng (với form gần đây)
  getAllRankings: (params = {}) => {
    return axiosClient.get('/rankings', { params });
  },

  // Lấy bảng xếp hạng của một event
  getRankingByEvent: (eventId, params = {}) => {
    return axiosClient.get(`/rankings/event/${eventId}`, { params });
  }
};

export default rankingApi;

