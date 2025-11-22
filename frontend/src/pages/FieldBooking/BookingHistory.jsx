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
} from "lucide-react";
import { message } from "antd";
import { fieldBookingService } from "../../api";
import { formatPrice } from "../../utils/formatPrice";

const statusMeta = {
  pending: {
    label: "Chờ xác nhận",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Đã xác nhận",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Hoàn thành",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Đã hủy",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
};

const filters = [
  { id: "all", label: "Tất cả" },
  { id: "upcoming", label: "Sắp diễn ra" },
  { id: "completed", label: "Hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

const formatDateTime = (value, options = {}) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString("vi-VN", {
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
  return date.toLocaleDateString("vi-VN", {
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
  return `${startDate.toLocaleTimeString("vi-VN", options)} - ${endDate.toLocaleTimeString(
    "vi-VN",
    options
  )}`;
};

const formatDateTimeCompact = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString("vi-VN", {
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

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await fieldBookingService.getUserBookings({
        sortBy: "startTime",
        sortOrder: "desc",
        limit: 100,
      });
      setBookings(data || []);
    } catch (error) {
      console.error("Load booking history error:", error);
      message.error("Không thể tải lịch sử đặt sân");
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
      (b) => new Date(b.startTime) > now && !["cancelled"].includes(b.status)
    ).length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    return { total, upcoming, completed, cancelled };
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
          return booking.status === "completed";
        }
        if (filter === "cancelled") {
          return booking.status === "cancelled";
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
              Theo dõi toàn bộ giao dịch đặt sân của bạn
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadBookings}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCcw className="w-4 h-4" />
              Làm mới
            </button>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Calendar className="w-4 h-4" />
              Đặt sân mới
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Tổng đơn", value: stats.total },
            { label: "Sắp diễn ra", value: stats.upcoming },
            { label: "Hoàn thành", value: stats.completed },
            { label: "Đã hủy", value: stats.cancelled },
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
              placeholder="Tìm theo tên sân hoặc ghi chú..."
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
                Đang tải lịch sử đặt sân...
              </span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900">
                Chưa có lịch sử đặt sân
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Đặt sân để bắt đầu theo dõi giao dịch của bạn.
              </p>
              <Link
                to="/book"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700"
              >
                <Calendar className="w-4 h-4" />
                Đặt sân ngay
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
                            {field.name || "Sân bóng"}
                          </p>
                          {renderStatus(booking.status)}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                          {field.fieldNumber && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              <MapPin className="w-3 h-3" />
                              Sân số {field.fieldNumber}
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
                              {field.capacity} người
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
                        Tổng tiền
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
                          Ngày diễn ra
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
                          Khung giờ
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
                          Ghi chú
                        </p>
                        <p className="font-medium line-clamp-2">
                          {booking.notes || "Không có"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gray-50 text-gray-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Thời gian đặt
                        </p>
                        <p className="font-medium">
                          {formatDateTimeCompact(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-dashed border-gray-200 pt-4 text-sm text-gray-500">
                    <span>Mã đơn: #{booking._id?.slice(-8)}</span>
                    <div className="inline-flex items-center gap-1 text-blue-600 font-medium">
                      Xem chi tiết
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;

