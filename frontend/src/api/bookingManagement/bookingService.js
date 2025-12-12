import bookingApi from './bookingApi';
import BaseService from '../base/BaseService';

class BookingService extends BaseService {
  constructor() {
    super(bookingApi);
  }

  // Get all bookings
  async getAllBookings(params = {}) {
    const result = await this.makeRequest(bookingApi.getAllBookings, params);
    return result;
  }

  // Get booking by ID
  async getBookingById(id) {
    const result = await this.makeRequest(bookingApi.getBookingById, id);
    return result;
  }

  // Create booking
  async createBooking(bookingData) {
    const result = await this.makeRequest(bookingApi.createBooking, bookingData);
    if (result.success) {
      this.showSuccess('Đặt sân thành công!');
    } else {
      this.showError(result.message);
    }
    return result;
  }

  // Update booking
  async updateBooking(id, updateData) {
    const result = await this.makeRequest(bookingApi.updateBooking, id, updateData);
    if (result.success) {
      this.showSuccess('Cập nhật booking thành công!');
    } else {
      this.showError(result.message);
    }
    return result;
  }

  // Cancel booking
  async cancelBooking(id) {
    const result = await this.makeRequest(bookingApi.cancelBooking, id);
    if (result.success) {
      this.showSuccess('Hủy booking thành công!');
    } else {
      this.showError(result.message);
    }
    return result;
  }

  // Delete booking
  async deleteBooking(id) {
    const result = await this.makeRequest(bookingApi.deleteBooking, id);
    if (!result.success) {
      this.showError(result.message);
    }
    return result;
  }

  // Check availability
  async checkAvailability(fieldId, date, timeSlotId) {
    const result = await this.makeRequest(bookingApi.checkAvailability, {
      fieldId,
      date,
      timeSlotId
    });
    return result;
  }

  // Get user bookings
  async getUserBookings(params = {}) {
    const result = await this.makeRequest(bookingApi.getUserBookings, params);
    return result;
  }

  // Format booking data for display
  formatBookingData(booking) {
    return {
      id: booking._id,
      fieldName: booking.fieldId?.name || 'Unknown Field',
      fieldNumber: booking.fieldId?.fieldNumber || '',
      fieldAddress: booking.fieldId?.address || '',
      date: this.formatDate(booking.startTime),
      timeSlot: `${booking.startTime?.split('T')[1]?.substring(0, 5)} - ${booking.endTime?.split('T')[1]?.substring(0, 5)}`,
      duration: booking.duration,
      totalPrice: this.formatCurrency(booking.totalPrice),
      status: this.getStatusText(booking.status),
      statusColor: this.getStatusColor(booking.status),
      notes: booking.notes,
      teamName: booking.teamId?.name || '',
      createdAt: this.formatDateTime(booking.createdAt),
      updatedAt: this.formatDateTime(booking.updatedAt)
    };
  }

  // Get status text in Vietnamese
  getStatusText(status) {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'cancelled': 'Đã hủy',
      'completed': 'Hoàn thành',
      'rejected': 'Từ chối'
    };
    return statusMap[status] || status;
  }

  // Get status color for UI
  getStatusColor(status) {
    const colorMap = {
      'pending': 'orange',
      'confirmed': 'green',
      'cancelled': 'red',
      'completed': 'blue',
      'rejected': 'red'
    };
    return colorMap[status] || 'default';
  }

  // Validate booking data
  validateBookingData(bookingData) {
    const errors = [];
    
    if (!bookingData.fieldId) {
      errors.push('Vui lòng chọn sân');
    }
    
    if (!bookingData.timeSlotId) {
      errors.push('Vui lòng chọn khung giờ');
    }
    
    if (!bookingData.date) {
      errors.push('Vui lòng chọn ngày');
    }
    
    if (bookingData.date) {
      const selectedDate = new Date(bookingData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.push('Ngày đặt sân phải trong tương lai');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Calculate booking duration
  calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end - start) / (1000 * 60 * 60); // hours
  }

  // Check if booking can be cancelled
  canCancelBooking(booking) {
    const now = new Date();
    const bookingStart = new Date(booking.startTime);
    const hoursUntilBooking = (bookingStart - now) / (1000 * 60 * 60);
    
    return booking.status === 'pending' || 
           (booking.status === 'confirmed' && hoursUntilBooking > 2);
  }

  // Check if booking can be updated
  canUpdateBooking(booking) {
    return booking.status === 'pending';
  }
}

export default new BookingService();
