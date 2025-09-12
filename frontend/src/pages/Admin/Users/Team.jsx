import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  Trophy,
  Calendar,
  Filter,
} from "lucide-react";
import axios from "axios";
import { message, Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useAuth } from "../../Authen/AuthContext";
const Team = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    coach: "",
    players: "",
    founded: "",
    league: "",
    status: "Hoạt động",
  });

  useEffect(() => {
    fetchTeams();
    fetchRegistrations();
  }, [currentPage]);

  const fetchRegistrations = async () => {
    try {
      setLoadingRegs(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingRegs(false);
        return;
      }
      const roleUpper = (user?.role || '').toString().toUpperCase();
      const url = roleUpper === 'ADMIN'
        ? 'http://localhost:5000/api/event-registrations'
        : 'http://localhost:5000/api/event-registrations/mine';

      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setRegistrations(res.data || []);
    } catch (err) {
      console.error(err);
      message.error("Không tải được danh sách đăng ký sự kiện");
    } finally {
      setLoadingRegs(false);
    }
  };

  const updateRegistrationStatus = async (registrationId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:5000/api/event-registrations/${registrationId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success(status === 'approved' ? 'Đã duyệt đội tham gia' : 'Đã từ chối đội tham gia');
      fetchRegistrations();
    } catch (err) {
      console.error(err);
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  const deleteRegistration = async (registrationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/event-registrations/${registrationId}` , {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Đã xóa đăng ký');
      setRegistrations((prev) => prev.filter((r) => r._id !== registrationId));
    } catch (err) {
      console.error(err);
      message.error('Xóa đăng ký thất bại');
    }
  };

  const confirmDeleteRegistration = (registration) => {
    Modal.confirm({
      title: 'Xóa đăng ký tham gia?',
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p className="mb-1">Bạn chắc chắn muốn xóa đăng ký này?</p>
          <p className="text-gray-500">Team: <span className="font-medium">{registration.teamId?.name || '-'}</span></p>
          <p className="text-gray-500">Event: <span className="font-medium">{registration.eventId?.name || '-'}</span></p>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => deleteRegistration(registration._id)
    });
  };
  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/team?page=${currentPage}&limit=8`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTeams(response.data.data || []);
      if (response.data.pagination && response.data.pagination.totalPages) {
        setTotalTeams(response.data.pagination.total);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setTotalTeams(response.data.data?.length || 0);
        setTotalPages(1);
      }
      setLoading(false);
    } catch (err) {
      setError("Lỗi khi tải dữ liệu đội bóng");
      setLoading(false);
      console.error(err);
    }
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.event.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "Tất cả" || team.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading && teams.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/team/${teamId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(users.filter((user) => user._id !== userId));
        alert("User deleted successfully");
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user");
      }
    }
  }

  const Pagination = () => {
    return (
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing{" "}
              <span className="font-medium">{((currentPage - 1) * 8) + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * 8, totalUsers)}
              </span>{" "}
              of <span className="font-medium">{totalUsers}</span>{" "}
              results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                  currentPage === 1
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                    currentPage === index + 1
                      ? "z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                  currentPage === totalPages
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Manager Team
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tổng đội bóng
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {teams.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {teams.filter((t) => t.status === "Hoạt động").length}
              </p>
            </div>
            <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tạm ngưng
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {teams.filter((t) => t.status === "Tạm ngưng").length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tổng cầu thủ
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {teams.reduce((sum, team) => sum + team.players, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm đội bóng..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="All">All Status</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Event Registrations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Đăng ký tham gia sự kiện</h2>
          {loadingRegs && <span className="text-sm text-gray-500">Đang tải...</span>}
        </div>
        <div className="overflow-x-auto" style={{ maxHeight: 8 * 64 + 'px', overflowY: 'auto' }}>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {(registrations || []).map((r) => (
                <tr key={r._id}>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img className="h-9 w-9 rounded-full object-cover" src={r.teamId?.avatar || "/default-avatar.png"} alt="team" />
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{r.teamId?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">{r.eventId?.name || '-'}</span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img className="h-8 w-8 rounded-full object-cover" src={r.teamId?.managerId?.avatar || "/default-avatar.png"} alt="manager" />
                      <span className="text-sm text-gray-900 dark:text-white">{r.teamId?.managerId?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateRegistrationStatus(r._id, 'approved')}
                        className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                        disabled={r.status === 'approved'}
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => updateRegistrationStatus(r._id, 'rejected')}
                        className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                        disabled={r.status === 'rejected'}
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => confirmDeleteRegistration(r)}
                        className={`px-2 py-1 text-xs rounded ${r.status === 'rejected' ? 'bg-gray-100 text-red-600 border border-red-200 hover:bg-red-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        disabled={r.status !== 'rejected'}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!registrations || registrations.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-sm text-gray-500">Không có đăng ký nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

  

    </div>
  );
};

export default Team;
