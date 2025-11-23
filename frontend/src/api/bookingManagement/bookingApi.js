import BaseApiClient from '../base/BaseApiClient';

class BookingApiClient extends BaseApiClient {
  constructor() {
    super('/bookings');
  }

  // Get all bookings
  async getAllBookings(params = {}) {
    return this.get('', params);
  }

  // Get booking by ID
  async getBookingById(id) {
    return this.get(`/${id}`);
  }

  // Create booking
  async createBooking(data) {
    return this.post('', data);
  }

  // Update booking
  async updateBooking(id, data) {
    return this.put(`/${id}`, data);
  }

  // Cancel booking
  async cancelBooking(id) {
    return this.patch(`/${id}/cancel`);
  }

  // Delete booking
  async deleteBooking(id) {
    return this.delete(`/${id}`);
  }

  // Check availability
  async checkAvailability(data) {
    return this.post('/check-availability', data);
  }

  // Get user bookings
  async getUserBookings(params = {}) {
    return this.get('/user', params);
  }
}

export default new BookingApiClient();
