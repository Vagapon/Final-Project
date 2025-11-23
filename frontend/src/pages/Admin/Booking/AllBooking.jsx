import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Modal, Spin, message, Select, DatePicker } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { bookingService } from '../../../api';
import { useAuth } from '../../Authen/AuthContext';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

const { RangePicker } = DatePicker;

const AllBooking = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  
  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, [currentPage, pageSize, statusFilter, paymentStatusFilter, dateRange]);

  // Inject custom styles for filter selects
  useEffect(() => {
    const styleId = 'booking-filter-select-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .booking-filter-select .ant-select-selector {
          padding-left: 32px !important;
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (dateRange && dateRange.length === 2) {
        // dayjs is required by antd DatePicker
        params.startDate = dateRange[0] ? dayjs(dateRange[0]).format('YYYY-MM-DD') : null;
        params.endDate = dateRange[1] ? dayjs(dateRange[1]).format('YYYY-MM-DD') : null;
      }

      const response = await bookingService.getAllBookings(params);
      
      if (response.success) {
        const bookingsData = response.data?.data || response.data || [];
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setTotalItems(response.data?.pagination?.totalItems || bookingsData.length);
        setTotalPages(response.data?.pagination?.totalPages || Math.ceil(bookingsData.length / pageSize));
        
        // Calculate stats
        calculateStats(bookingsData);
      } else {
        message.error(response.message || 'Failed to load bookings');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load bookings';
      message.error(errorMessage);
      setBookings([]);
    }
    setLoading(false);
  };

  const calculateStats = (bookingsData) => {
    const statsData = {
      total: bookingsData.length,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
      totalRevenue: 0,
    };

    bookingsData.forEach((booking) => {
      if (booking.status === 'pending') statsData.pending++;
      else if (booking.status === 'confirmed') statsData.confirmed++;
      else if (booking.status === 'cancelled') statsData.cancelled++;
      else if (booking.status === 'completed') statsData.completed++;

      if (booking.paymentStatus === 'paid' && booking.totalPrice) {
        statsData.totalRevenue += booking.totalPrice;
      }
    });

    setStats(statsData);
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdateLoading(true);
    try {
      const response = await bookingService.updateBooking(bookingId, { status: newStatus });
      if (response.success) {
        message.success('Status updated successfully!');
        await fetchBookings();
        setIsDetailModalOpen(false);
      } else {
        message.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      message.error('Failed to update status');
    }
    setUpdateLoading(false);
  };

  const handleDelete = async (bookingId) => {
    setDeleteLoading(true);
    try {
      const response = await bookingService.deleteBooking(bookingId);
      if (response.success) {
        message.success('Booking deleted successfully!');
        await fetchBookings();
        setIsDetailModalOpen(false);
      } else {
        message.error(response.message || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      message.error('Failed to delete booking');
    }
    setDeleteLoading(false);
  };

  const confirmDelete = (booking) => {
    Modal.confirm({
      title: 'Delete Booking?',
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p className="mb-1">Are you sure you want to delete this booking?</p>
          <p className="text-gray-500">Field: <span className="font-medium">{booking.fieldId?.name || 'N/A'}</span></p>
          <p className="text-gray-500">Booker: <span className="font-medium">{booking.userId?.name || 'N/A'}</span></p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => handleDelete(booking._id),
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { 
        bg: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        text: 'Pending'
      },
      confirmed: { 
        bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        text: 'Confirmed'
      },
      cancelled: { 
        bg: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        text: 'Cancelled'
      },
      completed: { 
        bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        text: 'Completed'
      },
    };

    const config = statusConfig[status] || { 
      bg: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      text: status 
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentStatusTag = (paymentStatus) => {
    const paymentConfig = {
      unpaid: { 
        bg: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        text: 'Unpaid'
      },
      paid: { 
        bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        text: 'Paid'
      },
      refunded: { 
        bg: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        text: 'Refunded'
      },
    };

    const config = paymentConfig[paymentStatus] || { 
      bg: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      text: paymentStatus 
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Check if current user can edit/delete this booking
  const canEditBooking = (booking) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true; // Admin can edit everything
    
    if (user.role === 'STAFF') {
      // Staff can only edit if field was not created by admin
      // Check if fieldId.managedByRole is ADMIN
      if (booking.fieldId?.managedByRole === 'ADMIN') {
        return false; // Staff cannot edit bookings for fields created by admin
      }
      return true; // Staff can edit their own or other staff's data
    }
    
    return false;
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    const fieldName = booking.fieldId?.name?.toLowerCase() || '';
    const userName = booking.userId?.name?.toLowerCase() || '';
    const userEmail = booking.userId?.email?.toLowerCase() || '';
    const fieldNumber = booking.fieldId?.fieldNumber?.toLowerCase() || '';

    return (
      fieldName.includes(searchLower) ||
      userName.includes(searchLower) ||
      userEmail.includes(searchLower) ||
      fieldNumber.includes(searchLower)
    );
  });

  return (
    <div className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Booking Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all user football field bookings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalItems}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.pending}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Confirmed
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.confirmed}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Revenue
              </p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 z-10" />
              <input
                type="text"
                placeholder="Search by field, user, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <div className="relative w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full h-10 booking-filter-select"
                placeholder="Status"
                style={{ height: '40px' }}
                dropdownStyle={{ zIndex: 1050 }}
              >
                <Select.Option value="all">All Status</Select.Option>
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="confirmed">Confirmed</Select.Option>
                <Select.Option value="cancelled">Cancelled</Select.Option>
                <Select.Option value="completed">Completed</Select.Option>
              </Select>
            </div>

            {/* Payment Status Filter */}
            <div className="relative w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
              <Select
                value={paymentStatusFilter}
                onChange={setPaymentStatusFilter}
                className="w-full h-10 booking-filter-select"
                placeholder="Payment"
                style={{ height: '40px' }}
                dropdownStyle={{ zIndex: 1050 }}
              >
                <Select.Option value="all">All</Select.Option>
                <Select.Option value="unpaid">Unpaid</Select.Option>
                <Select.Option value="paid">Paid</Select.Option>
                <Select.Option value="refunded">Refunded</Select.Option>
              </Select>
            </div>

            {/* Date Range */}
            <div className="w-full sm:w-auto">
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                placeholder={['From', 'To']}
                className="w-full sm:w-auto h-10"
                style={{ height: '40px' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={fetchBookings}
              className="flex items-center justify-center gap-2 px-4 h-10 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Booking List ({filteredBookings.length})
          </h3>
          {loading && <Spin size="small" />}
        </div>

        {loading && filteredBookings.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : filteredBookings.length > 0 ? (
          <>
            {/* Table for desktop */}
            <div className="hidden sm:block w-full overflow-x-auto">
              <table className="min-w-[700px] w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Booking Info
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Booker
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Booking Time / Slot
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {booking.fieldId?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          #{booking.fieldId?.fieldNumber || 'N/A'}
                        </div>
                        {booking.teamId && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Team: {booking.teamId.name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {booking.userId?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {booking.userId?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(booking.createdAt)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {booking.timeSlotId?.startTime && booking.timeSlotId?.endTime
                            ? `${booking.timeSlotId.startTime} - ${booking.timeSlotId.endTime}`
                            : booking.startTime && booking.endTime
                            ? `${dayjs(booking.startTime).format('HH:mm')} - ${dayjs(booking.endTime).format('HH:mm')}`
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatCurrency(booking.totalPrice)}
                        </div>
                        <div className="mt-1">
                          {getPaymentStatusTag(booking.paymentStatus)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusTag(booking.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {booking.status === 'pending' && canEditBooking(booking) && (
                            <button
                              onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                              title="Confirm"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {canEditBooking(booking) && (
                            <button
                              onClick={() => confirmDelete(booking)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Card list for mobile */}
            <div className="block sm:hidden p-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {booking.fieldId?.name || 'N/A'}
                      </div>
                      {getStatusTag(booking.status)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.userId?.name || 'N/A'} • {booking.userId?.email || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(booking.createdAt)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(booking.totalPrice)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(booking)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing{' '}
                      <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, totalItems)}
                      </span>{' '}
                      of <span className="font-medium">{totalItems}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-3 py-2 rounded-l-md border text-sm font-medium transition-colors ${
                          currentPage === 1
                            ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        Previous
                      </button>

                      {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                              currentPage === pageNumber
                                ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages}
                        className={`relative inline-flex items-center px-3 py-2 rounded-r-md border text-sm font-medium transition-colors ${
                          currentPage >= totalPages
                            ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Bookings
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || dateRange
                ? 'No bookings match the filters'
                : 'No bookings yet'}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        title="Booking Details"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedBooking(null);
        }}
        footer={null}
        width={800}
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Field
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {selectedBooking.fieldId?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  #{selectedBooking.fieldId?.fieldNumber || 'N/A'} - {selectedBooking.fieldId?.location || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Booker
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {selectedBooking.userId?.name || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedBooking.userId?.email || 'N/A'}
                </p>
                {selectedBooking.userId?.phone_number && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedBooking.userId.phone_number}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Booking Time
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(selectedBooking.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Time Slot
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedBooking.timeSlotId?.startTime && selectedBooking.timeSlotId?.endTime
                    ? `${selectedBooking.timeSlotId.startTime} - ${selectedBooking.timeSlotId.endTime}`
                    : selectedBooking.startTime && selectedBooking.endTime
                    ? `${dayjs(selectedBooking.startTime).format('HH:mm')} - ${dayjs(selectedBooking.endTime).format('HH:mm')}`
                    : 'N/A'}
                </p>
                {selectedBooking.timeSlotId?.timeType && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedBooking.timeSlotId.timeType === 'ca_sang' ? 'Morning' :
                     selectedBooking.timeSlotId.timeType === 'ca_chieu' ? 'Afternoon' :
                     selectedBooking.timeSlotId.timeType === 'ca_toi' ? 'Evening' :
                     selectedBooking.timeSlotId.timeType}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Match Start Time
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(selectedBooking.startTime)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Match End Time
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(selectedBooking.endTime)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </label>
                <div className="mt-1">
                  {getStatusTag(selectedBooking.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Payment
                </label>
                <div className="mt-1">
                  {getPaymentStatusTag(selectedBooking.paymentStatus)}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Amount
              </label>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(selectedBooking.totalPrice)}
              </p>
            </div>

            {selectedBooking.teamId && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Team
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedBooking.teamId.name}
                </p>
              </div>
            )}

            {selectedBooking.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Notes
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedBooking.notes}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created At
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(selectedBooking.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Updated At
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(selectedBooking.updatedAt)}
                </p>
              </div>
            </div>

            {/* Actions */}
            {canEditBooking(selectedBooking) && (
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedBooking.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking._id, 'confirmed')}
                    disabled={updateLoading}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {updateLoading ? <Spin size="small" /> : 'Confirm'}
                  </button>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking._id, 'completed')}
                    disabled={updateLoading}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {updateLoading ? <Spin size="small" /> : 'Complete'}
                  </button>
                )}
                <button
                  onClick={() => confirmDelete(selectedBooking)}
                  disabled={deleteLoading}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleteLoading ? <Spin size="small" /> : 'Delete'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllBooking;

