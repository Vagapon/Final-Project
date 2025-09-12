import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Users,
  Trophy,
  MapPin,
  Clock,
  Award,
  TrendingUp,
  Heart,
  Eye,
  Share2,
  PlayCircle,
} from "lucide-react";
import SearchFilter from "./SearchFilter";
import StatsSection from "./StatsSection";
import EventCard from "./EventCard";
import axios from "axios";

const Challenge = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [regsLoaded, setRegsLoaded] = useState(false);
  const joinedEventIds = useMemo(() => {
    const ids = (myRegistrations || []).map((r) => {
      const id = r?.eventId?._id ?? r?.eventId;
      return id ? String(id) : '';
    });
    // Merge with local cache fallback
    try {
      const cached = JSON.parse(localStorage.getItem('joinedEventIds') || '[]');
      const merged = [...ids, ...cached.map((x) => String(x))];
      return new Set(merged);
    } catch (_) {
      return new Set(ids);
    }
  }, [myRegistrations]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/event", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.success) {
          setEvents(response.data.data);
        } else {
          throw new Error("Failed to fetch events");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // Skip fetching registrations to avoid 403; rely on local cache fallback
    setRegsLoaded(true);
  }, []);

  // Calculate stats based on actual data
  const stats = useMemo(
    () => [
      {
        label: "Tổng sự kiện",
        value: events.length,
        icon: Trophy,
        change: "+12",
        color: "bg-blue-500",
      },
      {
        label: "Đang diễn ra",
        value: events.filter((event) => event.status === "Đang diễn ra").length,
        icon: Clock,
        change: "+5",
        color: "bg-green-500",
      },
      {
        label: "Người tham gia",
        value: events.reduce((acc, curr) => acc + (curr.participants || 0), 0),
        icon: Users,
        change: "+25",
        color: "bg-purple-500",
      },
      {
        label: "Tổng giải thưởng",
        value: "2.8B",
        icon: Award,
        change: "+8",
        color: "bg-orange-500",
      },
    ],
    [events]
  );

  // We now rely on event.participants coming from backend (approved teams only)

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!events.length) return [];

    return events.filter((event) => {
      const matchesSearch =
        !searchTerm ||
        (event.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (event.description?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (event.location?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      // Map sport size from sportTypeId.name if available: "Football 5/7/11"
      const sportName = typeof event.sportTypeId === 'object' ? (event.sportTypeId?.name || '').toLowerCase() : '';
      const isFive = sportName.includes('5');
      const isSeven = sportName.includes('7');
      const isEleven = sportName.includes('11');

      // Check joined
      const joinedEventIds = new Set((myRegistrations || []).map(r => {
        const raw = r?.eventId?._id ?? r?.eventId;
        return String(raw || '');
      })); 

      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "ongoing" && (event.status === "Đang diễn ra" || event.status === 'ongoing')) ||
        (selectedFilter === 'five' && isFive) ||
        (selectedFilter === 'seven' && isSeven) ||
        (selectedFilter === 'eleven' && isEleven) ||
        (selectedFilter === 'joined' && joinedEventIds.has(event._id));

      return matchesSearch && matchesFilter;
    });
  }, [events, searchTerm, selectedFilter, myRegistrations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-8 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <StatsSection stats={stats} />

        {/* Search & Filter */}
        <SearchFilter
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-gray-600">
            Hiển thị{" "}
            <span className="font-semibold text-gray-900">
              {filteredEvents.length}
            </span>{" "}
            sự kiện
            {searchTerm && (
              <span>
                {" "}
                cho "
                <span className="font-semibold text-blue-600">
                  {searchTerm}
                </span>
                "
              </span>
            )}
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 && regsLoaded && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {filteredEvents.map((event, index) => (
              <EventCard
                key={event._id}
                event={event}
                index={index}
                isJoined={joinedEventIds.has(String(event._id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenge;
