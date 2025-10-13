import axiosClient from '../axiosClient';

const memberApi = {
  // Lấy danh sách tất cả member
  getAllMembers: (params = {}) => {
    return axiosClient.get('/member', { params });
  },

  // Lấy chi tiết member theo ID
  getMemberById: (id) => {
    return axiosClient.get(`/member/${id}`);
  },

  // Tạo member mới
  createMember: (memberData) => {
    return axiosClient.post('/member', memberData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Cập nhật member
  updateMember: (id, memberData) => {
    return axiosClient.put(`/member/${id}`, memberData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Xóa member
  deleteMember: (id) => {
    return axiosClient.delete(`/member/${id}`);
  },

  // Lấy danh sách member của team
  getTeamMembers: (teamId) => {
    return axiosClient.get(`/member/team/${teamId}`);
  },

  // Thêm member vào team
  addMemberToTeam: (teamId, memberData) => {
    return axiosClient.post(`/member/team/${teamId}`, memberData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Import member từ Google Sheet
  importMembersFromSheet: (teamId, sheetUrl) => {
    return axiosClient.post('/member/google-sheet', {
      teamId,
      sheetUrl
    });
  },

  // Lấy thống kê member
  getMemberStats: (teamId) => {
    return axiosClient.get(`/member/stats${teamId ? `?teamId=${teamId}` : ''}`);
  },

  // Tìm kiếm member
  searchMembers: (query, teamId = null) => {
    return axiosClient.get('/member/search', { 
      params: { 
        q: query,
        ...(teamId && { teamId })
      }
    });
  },

  // Cập nhật trạng thái member
  updateMemberStatus: (id, status) => {
    return axiosClient.put(`/member/${id}/status`, { status });
  },

  // Cập nhật vai trò member (captain, vice-captain, player)
  updateMemberRole: (id, role) => {
    return axiosClient.put(`/member/${id}/role`, { role });
  }
};

export default memberApi;
