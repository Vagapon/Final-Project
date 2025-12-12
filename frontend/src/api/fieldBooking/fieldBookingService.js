// Field Booking Service - Business Logic
import fieldBookingApi from './fieldBookingApi';
import BaseService from '../base/BaseService';

class FieldBookingService extends BaseService {
  constructor() {
    super(fieldBookingApi);
  }

  // Get fields with business logic
  async getFields(filters = {}) {
    const result = await this.makeRequest(fieldBookingApi.getFields, filters);
    return result.success ? result.data : null;
  }

  // Get field details
  async getFieldDetails(fieldId) {
    const result = await this.makeRequest(fieldBookingApi.getFieldById, fieldId);
    return result.success ? result.data : null;
  }

  // Get field by ID (alias for getFieldDetails)
  async getFieldById(fieldId) {
    return this.getFieldDetails(fieldId);
  }

  // Get time slots for field
  async getTimeSlots(fieldId, params = {}) {
    const result = await this.makeRequest(fieldBookingApi.getTimeSlots, fieldId, params);
    return result.success ? result.data : null;
  }

  // Get time slots for field by date
  async fetchTimeSlotsByField(fieldId, date) {
    const params = date ? { date } : {};
    const result = await this.makeRequest(fieldBookingApi.getTimeSlots, fieldId, params);
    return result.success ? result.data : null;
  }

  // Check availability
  async checkAvailability(fieldId, date, timeSlotId) {
    const result = await this.makeRequest(fieldBookingApi.checkAvailability, {
      fieldId,
      date,
      timeSlotId
    });
    if (!result.success) {
      return null;
    }

    const payload = result.data;
    if (typeof payload === 'boolean') {
      return payload;
    }

    if (payload && typeof payload.isAvailable !== 'undefined') {
      return payload.isAvailable;
    }

    return null;
  }

  // Create booking
  async createBooking(bookingData) {
    // Validate required fields
    const requiredFields = ['fieldId', 'timeSlotId', 'date'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
      this.showError(`Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`);
      return { success: false, message: `Thiếu thông tin bắt buộc: ${missingFields.join(', ')}` };
    }

    const result = await this.makeRequest(fieldBookingApi.createBooking, bookingData);
    if (result.success) {
      this.showSuccess('Đặt sân thành công!');
    } else {
      this.showError(result.message);
    }
    return result;
  }

  // Get user bookings
  async getUserBookings(filters = {}) {
    const result = await this.makeRequest(fieldBookingApi.getUserBookings, filters);
    return result.success ? result.data : null;
  }

  // Get booking details
  async getBookingDetails(bookingId) {
    const result = await this.makeRequest(fieldBookingApi.getBookingById, bookingId);
    return result.success ? result.data : null;
  }

  // Update booking
  async updateBooking(bookingId, updateData) {
    const result = await this.makeRequest(fieldBookingApi.updateBooking, bookingId, updateData);
    if (result.success) {
      this.showSuccess('Cập nhật booking thành công!');
    } else {
      this.showError(result.message);
    }
    return result;
  }

  // Cancel booking
  async cancelBooking(bookingId) {
    const result = await this.makeRequest(fieldBookingApi.cancelBooking, bookingId);
    if (result.success) {
      this.showSuccess('Hủy booking thành công!');
    } else {
      this.showError(result.message);
    }
    return result;
  }

  // Delete booking
  async deleteBooking(bookingId) {
    const result = await this.makeRequest(fieldBookingApi.deleteBooking, bookingId);
    if (!result.success) {
      this.showError(result.message);
    }
    return result;
  }

  // Format booking data for display
  formatBookingData(booking) {
    return {
      id: booking._id,
      fieldName: booking.fieldId?.name || 'Unknown Field',
      fieldNumber: booking.fieldId?.fieldNumber || '',
      date: this.formatDate(booking.startTime),
      timeSlot: `${booking.startTime?.split('T')[1]?.substring(0, 5)} - ${booking.endTime?.split('T')[1]?.substring(0, 5)}`,
      duration: booking.duration,
      totalPrice: this.formatCurrency(booking.totalPrice),
      status: booking.status,
      createdAt: this.formatDateTime(booking.createdAt),
      updatedAt: this.formatDateTime(booking.updatedAt),
      notes: booking.notes
    };
  }

  // Format field data for display
  formatFieldData(field) {
    return {
      id: field._id,
      name: field.name,
      fieldNumber: field.fieldNumber,
      purpose: field.purpose,
      capacity: field.capacity,
      pricePerHour: this.formatCurrency(field.pricePerHour),
      location: field.location,
      address: field.address,
      description: field.description,
      features: field.features || [],
      images: field.images || [],
      status: field.status,
      managedBy: field.managedBy,
      openingHours: field.openingHours
    };
  }

  // Calculate total price
  calculateTotalPrice(pricePerHour, duration, multiplier = 1) {
    return pricePerHour * duration * multiplier;
  }

  // Validate booking time
  validateBookingTime(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    
    if (start <= now) {
      return { valid: false, message: 'Thời gian đặt sân phải trong tương lai' };
    }
    
    if (end <= start) {
      return { valid: false, message: 'Thời gian kết thúc phải sau thời gian bắt đầu' };
    }
    
    return { valid: true };
  }
}

export default new FieldBookingService();
