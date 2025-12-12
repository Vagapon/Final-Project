import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  RefreshCcw,
  Search,
  MapPin,
  Receipt,
  ChevronRight,
  Loader2,
  Users,
  X,
  CheckCircle,
  CreditCard,
  QrCode,
  Building2,
} from "lucide-react";
import { message, Modal } from "antd";
import { fieldBookingService } from "../../api";
import { formatPrice } from "../../utils/formatPrice";

const statusMeta = {
  pending: {
    label: "Pending",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Completed",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
};

const filters = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

const formatDateTime = (value, options = {}) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
};

const formatDateOnly = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTimeRange = (start, end) => {
  if (!start || !end) return "-";
  const startDate = new Date(start);
  const endDate = new Date(end);
  const options = { hour: "2-digit", minute: "2-digit", hour12: false };
  return `${startDate.toLocaleTimeString("en-US", options)} - ${endDate.toLocaleTimeString(
    "en-US",
    options
  )}`;
};

const formatDateTimeCompact = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentDetailModalVisible, setPaymentDetailModalVisible] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await fieldBookingService.getUserBookings({
        sortBy: "startTime",
        sortOrder: "desc",
        limit: 100,
      });
      
      // Handle different response structures
      let bookingsArray = [];
      if (Array.isArray(data)) {
        bookingsArray = data;
      } else if (data?.data && Array.isArray(data.data)) {
        bookingsArray = data.data;
      } else if (data?.data?.data && Array.isArray(data.data.data)) {
        bookingsArray = data.data.data;
      }
      
      console.log("All bookings loaded:", bookingsArray);
      console.log("Total bookings:", bookingsArray.length);
      
      if (bookingsArray.length === 0) {
        console.log("No bookings found");
        setBookings([]);
        return;
      }
      
      // Only show successfully paid bookings
      const successfulBookings = bookingsArray.filter(
        (booking) => {
          const isConfirmed = booking.status === "confirmed";
          const isPaid = booking.paymentStatus === "paid";
          const matches = isConfirmed && isPaid;
          if (!matches) {
            console.log("Booking filtered out:", {
              id: booking._id,
              status: booking.status,
              paymentStatus: booking.paymentStatus,
              isConfirmed,
              isPaid
            });
          }
          return matches;
        }
      );
      
      console.log("Successful bookings count:", successfulBookings.length);
      console.log("Successful bookings:", successfulBookings);
      setBookings(successfulBookings);
    } catch (error) {
      console.error("Load booking history error:", error);
      message.error("Unable to load booking history");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const now = new Date();

  const stats = useMemo(() => {
    const total = bookings.length;
    const upcoming = bookings.filter(
      (b) => new Date(b.startTime) > now && b.status === "confirmed" && b.paymentStatus === "paid"
    ).length;
    const completed = bookings.filter((b) => b.status === "completed" || (new Date(b.endTime) < now && b.status === "confirmed")).length;

    return { total, upcoming, completed };
  }, [bookings, now]);

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        const matchesSearch =
          !search ||
          booking.fieldId?.name?.toLowerCase().includes(search.toLowerCase()) ||
          booking.notes?.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === "upcoming") {
          return (
            new Date(booking.startTime) > now &&
            booking.status !== "cancelled"
          );
        }
        if (filter === "completed") {
          return booking.status === "completed" || (new Date(booking.endTime) < now && booking.status === "confirmed");
        }
        return true;
      })
      .sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
  }, [bookings, filter, search, now]);

  const renderStatus = (status) => {
    const meta = statusMeta[status] || {
      label: status,
      badge: "bg-gray-100 text-gray-700",
      dot: "bg-gray-400",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${meta.badge}`}
      >
        <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
        {meta.label}
      </span>
    );
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-500">
              Track all your field booking transactions
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadBookings}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Calendar className="w-4 h-4" />
              New Booking
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Orders", value: stats.total },
            { label: "Upcoming", value: stats.upcoming },
            { label: "Completed", value: stats.completed },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-4"
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full border transition ${
                  filter === item.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by field name or notes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* History list */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-600 text-sm">
                Loading booking history...
              </span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900">
                No booking history yet
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Book a field to start tracking your transactions.
              </p>
              <Link
                to="/book"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700"
              >
                <Calendar className="w-4 h-4" />
                Book Now
              </Link>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const field = booking.fieldId || {};
              return (
                <div
                  key={booking._id}
                  className="border border-gray-100 rounded-3xl p-4 md:p-5 hover:shadow-md transition bg-white"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={
                            field.images?.[0] ||
                            "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=300&fit=crop"
                          }
                          alt={field.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-base font-semibold text-gray-900">
                            {field.name || "Field"}
                          </p>
                          {renderStatus(booking.status)}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                          {field.fieldNumber && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              <MapPin className="w-3 h-3" />
                              Field #{field.fieldNumber}
                            </span>
                          )}
                          {field.purpose && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {field.purpose}
                            </span>
                          )}
                          {field.capacity && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              <Users className="w-3 h-3" />
                              {field.capacity} people
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                          <MapPin className="w-4 h-4" />
                          <span>{field.address || field.location || "—"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase text-gray-500">
                        Total Amount
                      </p>
                      <p className="text-xl font-semibold text-blue-600">
                        {formatPrice(booking.totalPrice || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Event Date
                        </p>
                        <p className="font-medium">
                          {formatDateOnly(booking.startTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Time Slot
                        </p>
                        <p className="font-medium">
                          {formatTimeRange(booking.startTime || "", booking.endTime || "")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Notes
                        </p>
                        <p className="font-medium line-clamp-2">
                          {booking.notes || "None"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gray-50 text-gray-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Booking Time
                        </p>
                        <p className="font-medium">
                          {formatDateTimeCompact(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-dashed border-gray-200 pt-4 text-sm text-gray-500">
                    <span>Order ID: #{booking._id?.slice(-8)}</span>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setPaymentDetailModalVisible(true);
                      }}
                      className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                    >
                      View Payment Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Payment Detail Modal */}
      <Modal
        open={paymentDetailModalVisible}
        onCancel={() => {
          setPaymentDetailModalVisible(false);
          setSelectedBooking(null);
        }}
        footer={null}
        width={800}
        className="payment-detail-modal"
      >
        {selectedBooking && <PaymentDetailModal booking={selectedBooking} />}
      </Modal>
    </div>
  );
};

// Payment Detail Modal Component
const PaymentDetailModal = ({ booking }) => {
  const field = booking.fieldId || {};
  const timeSlot = booking.timeSlotId || {};

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
        >
          Print Invoice
        </button>
      </div>

      {/* Payment Status */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">Payment Successful</h3>
            <p className="text-sm text-green-600">
              Transaction has been processed and confirmed
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Booking Info */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase mb-1">Field</p>
                  <p className="font-semibold text-gray-900">{field.name || "—"}</p>
                  <p className="text-sm text-gray-600 mt-1">{field.address || field.location || "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase mb-1">Booking Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDateOnly(booking.startTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase mb-1">Time Slot</p>
                  <p className="font-semibold text-gray-900">
                    {formatTimeRange(booking.startTime, booking.endTime)}
                  </p>
                  {timeSlot.timeType && (
                    <p className="text-sm text-gray-600 mt-1">
                      {timeSlot.timeType === "ca_sang" ? "Morning" :
                       timeSlot.timeType === "ca_chieu" ? "Afternoon" :
                       timeSlot.timeType === "ca_toi" ? "Evening" : ""}
                    </p>
                  )}
                </div>
              </div>

              {booking.notes && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase mb-1">Notes</p>
                    <p className="font-medium text-gray-900">{booking.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Payment Info */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Order ID</span>
                  <span className="font-mono font-semibold text-gray-900">#{booking._id?.slice(-8).toUpperCase()}</span>
                </div>
                {booking.paymentId && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Transaction ID</span>
                    <span className="font-mono font-semibold text-gray-900">{booking.paymentId}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Time</span>
                  <span className="font-medium text-gray-900">
                    {formatDateTimeCompact(booking.updatedAt || booking.createdAt)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Payment Method</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type</span>
                    <span className="font-medium text-gray-900">
                      {booking.paymentMethod === "sepay_qr" ? "QR Code (SePay)" : 
                       booking.paymentMethod || "Online Banking"}
                    </span>
                  </div>
                  {booking.paymentMethod === "sepay_qr" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Bank</span>
                        <span className="font-medium text-gray-900">MB Bank</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Account Number</span>
                        <span className="font-mono font-medium text-gray-900">VQRQAETEP9929</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Account Holder</span>
                        <span className="font-medium text-gray-900">TRAN TIEN VAN</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(booking.totalPrice || 0)}
                  </span>
                </div>
                {timeSlot.multiplier && timeSlot.multiplier !== 1 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Multiplier: {timeSlot.multiplier}x
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Status</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Booking</span>
                    <span className="text-xs font-medium text-green-600">Confirmed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Payment</span>
                    <span className="text-xs font-medium text-green-600">Paid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;

