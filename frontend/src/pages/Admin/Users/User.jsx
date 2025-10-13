import React from "react";
import {
  Search,
  Pencil,
  Trash2,
  Eye,
  Plus,
  Users,
  UserCheck,
  UserX,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Modal, Spin, message } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { userApi } from "../../../api";
import UserDetailModal from "./UserDetailModal";

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    staff: 0,
  });

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    // Calculate stats whenever users change
    if (Array.isArray(users) && users.length > 0) {
      const stats = {
        total: users.length,
        active: users.filter((user) => user.isActive).length,
        inactive: users.filter((user) => !user.isActive).length,
        admins: users.filter(
          (user) => user.role === "Admin" || user.role === "ADMIN"
        ).length,
        staff: users.filter(
          (user) => user.role === "Staff" || user.role === "STAFF"
        ).length,
      };
      setUserStats(stats);
    } else {
      // Reset stats when users is empty or not an array
      setUserStats({
        total: 0,
        active: 0,
        inactive: 0,
        admins: 0,
        staff: 0,
      });
    }
  }, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAllUsers({
        page: currentPage,
        limit: 8,
      });

      // Fix: Access the correct data structure from API response
      const usersData = response.data?.data || [];
      setUsers(usersData);
      setTotalUsers(response.data?.pagination?.total || usersData.length);
      setTotalPages(
        response.data?.totalPages || Math.ceil(usersData.length / 8)
      );
      setError(null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tải danh sách user";
      setError(errorMessage);
      message.error(errorMessage);
      // Set empty array on error to prevent filter issues
      setUsers([]);
    }
    setLoading(false);
  };

  // Lọc theo search term (client-side filtering)
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        return (
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const confirmDeleteUser = (user) => {
    Modal.confirm({
      title: "Delete User?",
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p className="mb-1">Are you sure you want to delete this user?</p>
          <p className="text-gray-500">
            Name: <span className="font-medium">{user.name}</span>
          </p>
          <p className="text-gray-500">
            Email: <span className="font-medium">{user.email}</span>
          </p>
        </div>
      ),
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => handleDelete(user._id),
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  const handleDelete = async (userId) => {
    setDeleteLoading(true);
    try {
      await userApi.deleteUser(userId);
      if (Array.isArray(users)) {
        setUsers(users.filter((user) => user._id !== userId));
      }
      message.success("Xóa user thành công!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi xóa user";
      message.error(errorMessage);
    }
    setDeleteLoading(false);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleEditUser = (user) => {
    // TODO: Implement edit functionality
    console.log("Edit user:", user);
    alert("Edit functionality will be implemented soon");
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    try {
      await userApi.updateUserStatus(userId, newStatus);
      // Update local state
      if (Array.isArray(users)) {
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, isActive: newStatus } : user
          )
        );
      }
      message.success(
        `User ${newStatus ? "đã kích hoạt" : "đã vô hiệu hóa"} thành công!`
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi cập nhật trạng thái user";
      message.error(errorMessage);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex-1 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing{" "}
              <span className="font-medium">{(currentPage - 1) * 8 + 1}</span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * 8, totalUsers)}
              </span>{" "}
              of <span className="font-medium">{totalUsers}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-2 rounded-l-md border text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Previous
              </button>

              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                      currentPage === pageNumber
                        ? "z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-3 py-2 rounded-r-md border text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
          User Management
        </h1>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
              />
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md">
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            User List ({filteredUsers.length})
          </h3>
          {loading && <Spin size="small" />}
        </div>

        {/* Table for desktop */}
        <div className="hidden sm:block w-full overflow-x-auto">
          {filteredUsers.length > 0 ? (
            <table className="min-w-[700px] w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Information
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
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
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {(currentPage - 1) * 8 + index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatar || "/default-avatar.png"}
                            alt={user.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || "No name"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {user._id?.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.phone_number || "No phone"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "Admin" || user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : user.role === "Staff" || user.role === "STAFF"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {user.role === "Admin" || user.role === "ADMIN"
                          ? "Administrator"
                          : user.role === "Staff" || user.role === "STAFF"
                            ? "Staff"
                            : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDeleteUser(user)}
                          disabled={deleteLoading}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Users Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm
                  ? "No users found matching your search criteria"
                  : "No users have been added to the system yet"}
              </p>
              {!searchTerm && (
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add First User
                </button>
              )}
            </div>
          )}
        </div>
        {/* Card list for mobile */}
        <div className="block sm:hidden p-4">
          {filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.name || "No name"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {user.phone_number || "No phone number"}
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "Admin" || user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : user.role === "Staff" || user.role === "STAFF"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                        >
                          {user.role === "Admin" || user.role === "ADMIN"
                            ? "Administrator"
                            : user.role === "Staff" || user.role === "STAFF"
                              ? "Staff"
                              : "User"}
                        </span>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => confirmDeleteUser(user)}
                        disabled={deleteLoading}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Users Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm
                  ? "No users found matching your search criteria"
                  : "No users have been added to the system yet"}
              </p>
              {!searchTerm && (
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add First User
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination />
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        user={selectedUser}
        onEdit={handleEditUser}
        onDelete={handleDelete}
        onToggleStatus={handleToggleUserStatus}
      />
    </div>
  );
};

export default User;
