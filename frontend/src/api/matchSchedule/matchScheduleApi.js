import axiosClient from '../axiosClient';

const matchScheduleApi = {
  // Lấy danh sách teams, fields và rounds cho UI
  getScheduleResources: (eventId) => {
    return axiosClient.get(`/event/${eventId}/schedule/resources`);
  },

  // Lấy danh sách trận đấu của event
  getEventMatches: (eventId, params = {}) => {
    return axiosClient.get(`/event/${eventId}/matches`, { params });
  },

  // Lấy lịch thi đấu của event (API tự động)
  getEventSchedule: (eventId, params = {}) => {
    return axiosClient.get(`/event/${eventId}/schedule`, { params });
  },

  // Tạo lịch thi đấu vòng tròn cho event (API tự động)
  createRoundRobinSchedule: (eventId, data) => {
    return axiosClient.post(`/event/${eventId}/schedule`, data);
  },

  // Tạo trận đấu đơn lẻ (cho UI thủ công)
  createSingleMatch: (eventId, data) => {
    return axiosClient.post(`/event/${eventId}/match`, data);
  },

  // Cập nhật trận đấu
  updateSingleMatch: (matchId, data) => {
    return axiosClient.put(`/event/match/${matchId}`, data);
  },

  // Cập nhật kết quả trận đấu
  updateMatchResult: (matchId, data) => {
    return axiosClient.put(`/event/match/${matchId}/result`, data);
  },

  // Xóa trận đấu đơn lẻ
  deleteSingleMatch: (matchId) => {
    return axiosClient.delete(`/event/match/${matchId}`);
  },

  // Xóa lịch thi đấu của event
  deleteEventSchedule: (eventId) => {
    return axiosClient.delete(`/event/${eventId}/schedule`);
  }
};

export default matchScheduleApi;

