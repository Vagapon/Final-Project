// Field Booking API calls
import axiosClient from '../axiosClient';

const fieldBookingApi = {
  // Get all fields with filters
  getFields: (params) => axiosClient.get("/fields", { params }),
  
  // Get field by ID
  getFieldById: (id) => axiosClient.get(`/fields/${id}`),
  
  // Get fields by purpose
  getFieldsByPurpose: (purpose) => axiosClient.get(`/fields/purpose/${purpose}`),
  
  // Get time slots for a field
  getTimeSlots: (fieldId, params) => axiosClient.get(`/timeslots/field/${fieldId}`, { params }),
  
  // Create booking
  createBooking: (data) => axiosClient.post("/bookings", data),
  
  // Get user bookings
  getUserBookings: (params) => axiosClient.get("/bookings/user", { params }),
  
  // Get booking by ID
  getBookingById: (id) => axiosClient.get(`/bookings/${id}`),
  
  // Update booking
  updateBooking: (id, data) => axiosClient.put(`/bookings/${id}`, data),
  
  // Cancel booking
  cancelBooking: (id) => axiosClient.patch(`/bookings/${id}/cancel`),
  
  // Delete booking
  deleteBooking: (id) => axiosClient.delete(`/bookings/${id}`),
  
  // Check availability
  checkAvailability: (data) => axiosClient.post("/bookings/check-availability", data),
};

export default fieldBookingApi;
