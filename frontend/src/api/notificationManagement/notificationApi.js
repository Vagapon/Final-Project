import axiosClient from '../axiosClient';

const notificationApi = {
  // Lấy tất cả notifications của user
  getNotifications: (params = {}) => {
    const url = '/notifications';
    return axiosClient.get(url, { params });
  },

  // Lấy số lượng notifications chưa đọc
  getUnreadCount: () => {
    const url = '/notifications/unread-count';
    return axiosClient.get(url);
  },

  // Đánh dấu notification là đã đọc
  markAsRead: (id) => {
    const url = `/notifications/${id}/read`;
    return axiosClient.put(url);
  },

  // Đánh dấu tất cả notifications là đã đọc
  markAllAsRead: () => {
    const url = '/notifications/mark-all-read';
    return axiosClient.put(url);
  },

  // Xóa notification
  deleteNotification: (id) => {
    const url = `/notifications/${id}`;
    return axiosClient.delete(url);
  }
};

export default notificationApi;

