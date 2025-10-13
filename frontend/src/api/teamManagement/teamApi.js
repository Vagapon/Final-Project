import axiosClient from '../axiosClient';

const teamApi = {
  // Lấy danh sách tất cả team
  getAllTeams: (params = {}) => {
    return axiosClient.get('/team', { params });
  },

  // Lấy chi tiết team theo ID
  getTeamById: (id) => {
    return axiosClient.get(`/team/${id}`);
  },

  // Lấy team của user hiện tại
  getMyTeam: () => {
    return axiosClient.get('/team/myteam');
  },

  // Tạo team mới
  createTeam: (teamData) => {
    return axiosClient.post('/team', teamData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Cập nhật team
  updateTeam: (id, teamData) => {
    return axiosClient.put(`/team/${id}`, teamData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Xóa team
  deleteTeam: (id) => {
    return axiosClient.delete(`/team/${id}`);
  },

  // Lấy danh sách thành viên của team
  getTeamMembers: (teamId) => {
    return axiosClient.get(`/member/team/${teamId}`);
  },

  // Thêm thành viên vào team
  addTeamMember: (teamId, memberData) => {
    return axiosClient.post(`/member/team/${teamId}`, memberData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Cập nhật thành viên team
  updateTeamMember: (memberId, memberData) => {
    return axiosClient.put(`/member/${memberId}`, memberData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Xóa thành viên khỏi team
  removeTeamMember: (memberId) => {
    return axiosClient.delete(`/member/${memberId}`);
  },


  // Lấy thống kê team
  getTeamStats: (teamId) => {
    return axiosClient.get(`/team/${teamId}/stats`);
  },

  // Tìm kiếm team
  searchTeams: (query) => {
    return axiosClient.get('/team/search', { params: { q: query } });
  },

  // Cập nhật trạng thái team
  updateTeamStatus: (id, status) => {
    return axiosClient.put(`/team/${id}/status`, { status });
  }
};

export default teamApi;
