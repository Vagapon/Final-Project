import {
  Heart,
  Share2,
  PlayCircle,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { message } from "antd";

const EventCard = ({ event, index, isJoined = false, participantsOverride }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [myTeamId, setMyTeamId] = useState(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(!!isJoined);
  const [participantsCount, setParticipantsCount] = useState(participantsOverride ?? event.participants ?? 0);
  // Skip API checks on mount to avoid 403 noise; rely on parent props and cache

 const handleRegister = async () => {
    try {
      setIsRegistering(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        message.error("Vui lòng đăng nhập để đăng ký sự kiện");
        return;
      }

      // Lazy fetch my team if not cached
      let teamIdToUse = myTeamId;
      if (!teamIdToUse) {
        try {
          const teamRes = await axios.get("http://localhost:5000/api/team/myteam", {
            headers: { Authorization: `Bearer ${token}` }
          });
          teamIdToUse = teamRes.data?._id || null;
          setMyTeamId(teamIdToUse);
        } catch (err) {
          const msg = err?.response?.status === 404
            ? "Bạn chưa có đội hoặc không phải manager của đội. Vui lòng tạo/chọn đội trước."
            : "Không thể lấy thông tin đội của bạn";
          message.error(msg);
          return;
        }
      }

      const response = await axios.post(
        "http://localhost:5000/api/event-registrations",
        { eventId: event._id, teamId: teamIdToUse },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        setIsAlreadyRegistered(true); // Cập nhật state ngay sau khi đăng ký thành công
        // Don't increment participants count here as team is only pending, not approved yet
        message.success("Đăng ký thành công, vui lòng chờ phê duyệt");

        // Cache joined event locally for fallback on next reload
        try {
          const cached = JSON.parse(localStorage.getItem('joinedEventIds') || '[]');
          if (!cached.includes(event._id)) {
            cached.push(event._id);
            localStorage.setItem('joinedEventIds', JSON.stringify(cached));
          }
        } catch (_) {}
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại";
      if (error.response?.status === 400 && errorMessage.includes('already registered')) {
        // Nếu backend báo trùng đăng ký, vẫn cập nhật UI để disable nút
        setIsAlreadyRegistered(true);
      }
      message.error(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  // Sync from parent prop so UI is correct right after page load
  useEffect(() => {
    setIsAlreadyRegistered(!!isJoined);
  }, [isJoined]);

  useEffect(() => {
    if (typeof participantsOverride === 'number') {
      setParticipantsCount(participantsOverride);
    }
  }, [participantsOverride]);

  // Fallback: read local cache if API fails or user not manager
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('joinedEventIds') || '[]');
      if (Array.isArray(cached) && cached.includes(event._id)) {
        setIsAlreadyRegistered(true);
      }
    } catch (_) {}
  }, [event._id]);

  const getStatusColor = (status) => {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
      case "ongoing":
        return "bg-green-100 text-green-800 border-green-200"; // Đang diễn ra
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"; // Sắp diễn ra
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"; // Đã kết thúc
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"; // fallback
    }
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.avatar || "default-image-url"}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&crop=center";
          }}
        />

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <div
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getStatusColor(
              event.status
            )}`}
          >
            <span className="capitalize">{(event.status || '').toLowerCase()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200">
            <Heart className="w-4 h-4 text-red-500" />
          </button>
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200">
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
          {event.name}
        </h3>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>{event.location}</span>
          </div>
          {/* Sport Type Display */}
          {event.sportTypeId && (
            <div className="flex items-center gap-1">
              <span className="text-lg">⚽</span>
              <span>
                {typeof event.sportTypeId === "object"
                  ? event.sportTypeId.name
                  : "Loading sport type..."}
              </span>
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {event.description}
        </p>

        {/* Event Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {new Date(event.startDate).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500">Ngày bắt đầu</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
            <Users className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {participantsCount}
              </div>
              <div className="text-xs text-gray-500">Tham gia</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
      className={`w-full py-3.5 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
        isAlreadyRegistered
          ? "bg-green-100 text-green-800 cursor-not-allowed"
          : (event.status || '').toLowerCase() === "completed" || isRegistering
          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
          : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl hover:scale-105"
      }`}
      disabled={(event.status || '').toLowerCase() === "completed" || isRegistering || isAlreadyRegistered}
      onClick={isAlreadyRegistered ? undefined : handleRegister}
    >
      {(event.status || '').toLowerCase() === "completed" ? (
        "Đã kết thúc"
      ) : isAlreadyRegistered ? (
        <span className="flex items-center justify-center gap-2">
          <Users className="w-5 h-5" />
          Đã đăng ký tham gia
        </span>
      ) : isRegistering ? (
        "Đang đăng ký..."
      ) : (
        <span className="flex items-center justify-center gap-2">
          <PlayCircle className="w-5 h-5" />
          Tham gia ngay
        </span>
      )}
    </button>
      </div>
    </div>
  );
};

export default EventCard;
