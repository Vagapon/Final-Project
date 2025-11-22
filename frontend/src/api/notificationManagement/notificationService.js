import notificationApi from './notificationApi';

const notificationService = {
  // Lấy notifications với pagination
  async getNotifications(page = 1, limit = 20, isRead = null) {
    try {
      const params = { page, limit };
      if (isRead !== null) {
        params.isRead = isRead;
      }
      const response = await notificationApi.getNotifications(params);
      // Axios trả về { data: {...} }, nên response.data là object từ backend
      const backendData = response.data;
      // Backend trả về { success, data: [...], pagination, unreadCount }
      // Đảm bảo data luôn là array
      const notificationsData = Array.isArray(backendData?.data) 
        ? backendData.data 
        : [];
      
      return {
        success: backendData?.success !== false,
        data: notificationsData,
        pagination: backendData?.pagination,
        unreadCount: backendData?.unreadCount || 0
      };
    } catch (error) {
      console.error('Get notifications error:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Lỗi khi lấy thông báo',
        error: error.response?.data?.error || error.message
      };
    }
  },

  // Lấy số lượng notifications chưa đọc
  async getUnreadCount() {
    try {
      const response = await notificationApi.getUnreadCount();
      const backendData = response.data;
      return {
        success: backendData?.success !== false,
        unreadCount: backendData?.unreadCount || 0
      };
    } catch (error) {
      console.error('Get unread count error:', error);
      return {
        success: false,
        unreadCount: 0,
        error: error.response?.data?.error || error.message
      };
    }
  },

  // Đánh dấu notification là đã đọc
  async markAsRead(id) {
    try {
      const response = await notificationApi.markAsRead(id);
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Mark as read error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi đánh dấu đã đọc',
        error: error.response?.data?.error || error.message
      };
    }
  },

  // Đánh dấu tất cả notifications là đã đọc
  async markAllAsRead() {
    try {
      const response = await notificationApi.markAllAsRead();
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Mark all as read error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi đánh dấu tất cả đã đọc',
        error: error.response?.data?.error || error.message
      };
    }
  },

  // Xóa notification
  async deleteNotification(id) {
    try {
      const response = await notificationApi.deleteNotification(id);
      return {
        success: true,
        message: response.message
      };
    } catch (error) {
      console.error('Delete notification error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Lỗi khi xóa thông báo',
        error: error.response?.data?.error || error.message
      };
    }
  }
};

export default notificationService;

