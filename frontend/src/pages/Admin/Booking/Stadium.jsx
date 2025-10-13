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
  Star,
  Wifi,
  Car,
  ChevronLeft,
  ChevronRight,
  ShowerHead,
  Zap,
  Camera,
  Shield,
} from 'lucide-react';
import { Modal, Spin } from 'antd';
import { ExclamationCircleFilled, ClockCircleOutlined } from '@ant-design/icons';
import CreateFieldModal from '../../ModalBooking/CreateFieldModal';
import EditFieldModal from '../../ModalBooking/EditFieldModal';
import FieldDetailModal from '../../ModalBooking/FieldDetailModal';
import TimeSlotModal from '../../ModalBooking/TimeSlotModal';
import { fieldApi } from '../../../api';
import { message } from 'antd';

const Stadium = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [timeSlotModalVisible, setTimeSlotModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState('All');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const response = await fieldApi.getAllFields();
      setFields(response.data.data || response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể tải danh sách sân bóng';
      message.error(errorMessage);
      console.error('Error fetching fields:', error);
    }
    setLoading(false);
  };

  const handleCreate = async (formData) => {
    try {
      console.log('Creating field with data:', formData);
      const response = await fieldApi.createField(formData);
      console.log('Create field response:', response);
      
      // Kiểm tra response structure
      if (response && response.data) {
        if (response.data.success || response.data.data) {
          message.success('Tạo sân bóng thành công!');
          setCreateModalVisible(false);
          await fetchFields(); // Refresh danh sách
          return { success: true };
        } else {
          message.error(response.data.message || 'Tạo sân bóng thất bại');
          return { success: false, message: response.data.message };
        }
      } else {
        message.success('Tạo sân bóng thành công!');
        setCreateModalVisible(false);
        await fetchFields(); // Refresh danh sách
        return { success: true };
      }
    } catch (error) {
      console.error('Error creating field:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tạo sân bóng';
      message.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const handleEdit = async (formData) => {
    setEditLoading(true);
    try {
      const response = await fieldApi.updateField(selectedField._id, formData);
      message.success('Cập nhật sân bóng thành công!');
      setEditModalVisible(false);
      setSelectedField(null);
      await fetchFields(); // Refresh danh sách
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật sân bóng';
      message.error(errorMessage);
      console.error('Error updating field:', error);
    }
    setEditLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fieldApi.deleteField(id);
      message.success('Xóa sân bóng thành công!');
      fetchFields(); // Refresh danh sách
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể xóa sân bóng';
      message.error(errorMessage);
      console.error('Error deleting field:', error);
    }
  };

  const confirmDeleteField = (field) => {
    Modal.confirm({
      title: 'Xóa sân bóng?',
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p className="mb-1">Are you sure you want to delete this field?</p>
          <p className="text-gray-500">Stadium Name: <span className="font-medium">{field.name}</span></p>
          <p className="text-gray-500">Location: <span className="font-medium">{field.location}</span></p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancle',
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
        return 'active';
      case 'maintenance':
        return 'maintenance';
      case 'inactive':
        return 'inactive';
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

  // Component for facility icons
  const FacilityIcon = ({ type }) => {
    const facilityIcons = {
      wifi: Wifi,
      parking: Car,
      shower: ShowerHead,
      lighting: Zap,
      camera: Camera,
      security: Shield
    };
    const Icon = facilityIcons[type];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  // Stadium Card Component with Image Carousel
  const StadiumCard = ({ field }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = field.images && field.images.length > 0 ? field.images : [];

    const nextImage = (e) => {
      e.stopPropagation();
      if (images.length > 1) {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }
    };

    const prevImage = (e) => {
      e.stopPropagation();
      if (images.length > 1) {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    return (
      <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-1">
        {/* Card Header with Image Carousel */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-600 to-green-500 rounded-t-xl overflow-hidden">
          {images.length > 0 ? (
            <>
              <img 
                src={images[currentImageIndex]} 
                alt={`${field.name} - ${currentImageIndex + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              
              {/* Image Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Image Count Badge */}
              {images.length > 1 && (
                <div className="absolute top-2 right-12 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                  <span className="text-white text-xs font-medium">
                    {currentImageIndex + 1}/{images.length}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-16 w-16 text-white/80" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              field.status === 'active' 
                ? 'bg-green-500 text-white' 
                : field.status === 'maintenance' 
                ? 'bg-orange-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {getStatusText(field.status)}
            </span>
          </div>

          {/* Purpose Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              field.purpose === 'event' 
                ? 'bg-blue-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {getPurposeText(field.purpose)}
            </span>
          </div>

          {/* Field Number Badge */}
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-white text-sm font-medium">#{field.fieldNumber}</span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-4">
          {/* Stadium Name & Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {field.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
              {field.description || 'Không có mô tả'}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-gray-900 dark:text-white font-medium line-clamp-1">
                {field.address}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {field.location}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {field.pricePerHour ? `${field.pricePerHour.toLocaleString('vi-VN')} VNĐ/giờ` : 'Miễn phí'}
            </span>
          </div>

        {/* Facilities */}
        {field.facilities && field.facilities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {field.facilities.slice(0, 4).map((facility, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-md px-3 py-1.5 border border-gray-200 dark:border-gray-700">
                <FacilityIcon type={facility} />
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {facility}
                </span>
              </div>
            ))}
            {field.facilities.length > 4 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md px-3 py-1.5 border border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  +{field.facilities.length - 4} more
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center pt-3 border-t border-gray-100 dark:border-gray-700">
  {/* Rating nếu có */}
  {field.rating && (
    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
      <Star className="h-4 w-4 text-gray-400" />
      <span className="text-sm">{field.rating.toFixed(1)}</span>
    </div>
  )}

  {/* Action buttons luôn ở bên phải */}
  <div className="flex gap-1 ml-auto">
    <button
      onClick={() => {
        setSelectedField(field);
        setDetailModalVisible(true);
      }}
      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
      title="Xem chi tiết"
    >
      <Eye className="h-4 w-4" />
    </button>
    <button
      onClick={() => {
        setSelectedField(field);
        setTimeSlotModalVisible(true);
      }}
      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
      title="Quản lý khung giờ"
    >
      <ClockCircleOutlined className="h-4 w-4" />
    </button>
    <button
      onClick={() => {
        setSelectedField(field);
        setEditModalVisible(true);
      }}
      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
      title="Chỉnh sửa"
    >
      <Edit2 className="h-4 w-4" />
    </button>
    <button
      onClick={() => confirmDeleteField(field)}
      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
      title="Xóa"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
</div>

      </div>
    </div>
    );
  };

  if (loading && fields.length === 0) return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;

  return (
    <div className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Stadium Management
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
                Event Stadium
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
                Rental Stadium
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
                placeholder="Search by name, number or location..."
                value={searchText}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <select
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              >
                <option value="All">All type of stadium</option>
                <option value="event">Event stadium</option>
                <option value="rental">Rental stadium</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              >
                <option value="All">All status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={() => setCreateModalVisible(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            New Stadium
          </button>
        </div>
      </div>

      {/* Stadium Gallery */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stadium Gallery ({filteredFields.length} stadiums)
          </h2>
          {loading && <Spin size="small" />}
        </div>
        
        {filteredFields.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFields.map((field, index) => (
              <div
                key={field._id}
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                <StadiumCard field={field} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Không có sân bóng nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Hãy thêm sân bóng đầu tiên của bạn
            </p>
            <button
              onClick={() => setCreateModalVisible(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm sân bóng
            </button>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <CreateFieldModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onCreate={handleCreate}
      />

      <EditFieldModal
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedField(null);
        }}
        onUpdate={handleEdit}
        initialValues={selectedField}
        loading={editLoading}
      />

      <FieldDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        field={selectedField}
      />

      <TimeSlotModal
        visible={timeSlotModalVisible}
        onCancel={() => setTimeSlotModalVisible(false)}
        field={selectedField}
      />
    </div>
  );
};

export default Stadium;