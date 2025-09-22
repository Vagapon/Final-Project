import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Users,
  DollarSign,
  Activity,
  Filter,
  Eye,
} from 'lucide-react';
import { message, Modal, Spin } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import CreateFieldModal from '../../ModalBooking/CreateFieldModal';
import EditFieldModal from '../../ModalBooking/EditFieldModal';
import FieldDetailModal from '../../ModalBooking/FieldDetailModal';
import axios from 'axios';

const Stadium = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState('All');

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/fields', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setFields(response.data.data);
      } else {
        message.error('Lỗi khi tải danh sách sân');
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
      message.error('Lỗi khi tải danh sách sân');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/fields', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        message.success('Tạo sân bóng thành công!');
        setCreateModalVisible(false);
        fetchFields(); // Refresh danh sách
      } else {
        message.error(response.data.message || 'Lỗi khi tạo sân');
      }
    } catch (error) {
      console.error('Error creating field:', error);
      message.error(error.response?.data?.message || 'Lỗi khi tạo sân');
    }
  };

  const handleEdit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/fields/${selectedField._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        message.success('Cập nhật sân bóng thành công!');
        setEditModalVisible(false);
        fetchFields(); // Refresh danh sách
      } else {
        message.error(response.data.message || 'Lỗi khi cập nhật sân');
      }
    } catch (error) {
      console.error('Error updating field:', error);
      message.error(error.response?.data?.message || 'Lỗi khi cập nhật sân');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/fields/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        message.success('Xóa sân bóng thành công!');
        fetchFields(); // Refresh danh sách
      } else {
        message.error(response.data.message || 'Lỗi khi xóa sân');
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      message.error(error.response?.data?.message || 'Lỗi khi xóa sân');
    }
  };

  const confirmDeleteField = (field) => {
    Modal.confirm({
      title: 'Xóa sân bóng?',
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p className="mb-1">Bạn có chắc chắn muốn xóa sân bóng này?</p>
          <p className="text-gray-500">Tên sân: <span className="font-medium">{field.name}</span></p>
          <p className="text-gray-500">Vị trí: <span className="font-medium">{field.location}</span></p>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => handleDelete(field._id)
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'maintenance':
        return 'orange';
      case 'inactive':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'maintenance':
        return 'Bảo trì';
      case 'inactive':
        return 'Ngừng hoạt động';
      default:
        return status;
    }
  };

  const getPurposeText = (purpose) => {
    switch (purpose) {
      case 'event':
        return 'Sân giải đấu';
      case 'rental':
        return 'Sân thuê';
      default:
        return purpose;
    }
  };

  const getPurposeColor = (purpose) => {
    switch (purpose) {
      case 'event':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'rental':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredFields = fields.filter(field => {
    const matchesSearch = field.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         field.location.toLowerCase().includes(searchText.toLowerCase()) ||
                         field.fieldNumber.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'All' || field.status === statusFilter;
    const matchesPurpose = purposeFilter === 'All' || field.purpose === purposeFilter;
    return matchesSearch && matchesStatus && matchesPurpose;
  });

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  if (loading && fields.length === 0) return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;

  return (
    <div className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Quản lý sân bóng
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tổng số sân
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {fields.length}
              </p>
            </div>
            <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sân giải đấu
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {fields.filter((f) => f.purpose === "event").length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sân thuê
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {fields.filter((f) => f.purpose === "rental").length}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sân hoạt động
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {fields.filter((f) => f.status === "active").length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400" />
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
                placeholder="Tìm kiếm theo tên sân, số sân hoặc địa điểm..."
                value={searchText}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <select
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="All">Tất cả loại sân</option>
                <option value="event">Sân giải đấu</option>
                <option value="rental">Sân thuê</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="maintenance">Bảo trì</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </div>
          </div>
          <button
                onClick={() => setCreateModalVisible(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
            <Plus className="h-4 w-4" />
                Thêm sân bóng mới
          </button>
        </div>
        </div>

      {/* Fields Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Danh sách sân bóng</h2>
          {loading && <Spin size="small" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên sân</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Số sân</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Loại sân</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Địa điểm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giá thuê</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFields.map((field) => (
                <tr key={field._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{field.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{field.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{field.fieldNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPurposeColor(field.purpose)}`}>
                      {getPurposeText(field.purpose)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-white">{field.address}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{field.location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {field.pricePerHour ? `${field.pricePerHour.toLocaleString('vi-VN')} VNĐ/giờ` : 'Miễn phí'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      field.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : field.status === 'maintenance' 
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {getStatusText(field.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedField(field);
                          setDetailModalVisible(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedField(field);
                          setEditModalVisible(true);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmDeleteField(field)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!fields || fields.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Không có sân bóng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateFieldModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onCreate={handleCreate}
      />

      <EditFieldModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onUpdate={handleEdit}
        initialValues={selectedField}
      />

      <FieldDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        field={selectedField}
      />
    </div>
  );
};

export default Stadium;