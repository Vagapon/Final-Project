import React, { useState } from 'react';
import {
  Modal,
  Tag,
  Row,
  Col,
  Card,
} from 'antd';
import {
  EyeOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';

const FieldDetailModal = ({ visible, onCancel, field, onBookField }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!field) return null;
  
  const images = field.images && field.images.length > 0 ? field.images : [];

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
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
        return 'Active';
      case 'maintenance':
        return 'Maintenance';
      case 'inactive':
        return 'Inactive';
      default:
        return status;
    }
  };

  const getPurposeText = (purpose) => {
    switch (purpose) {
      case 'event':
        return 'Event field';
      case 'rental':
        return 'Rental field';
      default:
        return purpose;
    }
  };

  const getPurposeColor = (purpose) => {
    switch (purpose) {
      case 'event':
        return 'blue';
      case 'rental':
        return 'green';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal
      title="Field Details"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      destroyOnClose
      className="field-detail-modal"
    >
      <div className="space-y-6">
        {/* Hero Image Carousel */}
        <div className="relative h-80 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-green-500">
          {images.length > 0 ? (
            <>
              <img 
                src={images[currentImageIndex]} 
                alt={`${field.name} - ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10"
                  >
                    <LeftOutlined />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10"
                  >
                    <RightOutlined />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Image Count */}
              {images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <EnvironmentOutlined className="text-6xl mb-4 opacity-50" />
                <p className="text-lg">Không có hình ảnh</p>
              </div>
            </div>
          )}

          {/* Overlay with Stadium Name & Status */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{field.name}</h1>
                <div className="flex items-center space-x-6 text-white/90">
                  <span className="flex items-center text-sm">
                    <ToolOutlined className="mr-2 text-white/70" />
                    #{field.fieldNumber}
                  </span>
                  <span className="flex items-center text-sm">
                    <EnvironmentOutlined className="mr-2 text-white/70" />
                    {field.location}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Tag color={getPurposeColor(field.purpose)} className="text-sm px-3 py-1">
                  {getPurposeText(field.purpose)}
                </Tag>
                <Tag color={getStatusColor(field.status)} className="text-sm px-3 py-1">
                  {getStatusText(field.status)}
                </Tag>
              </div>
            </div>
          </div>
        </div>

        {/* Field Information */}
        <Row gutter={24}>
          <Col span={12}>
            <Card title="Basic Information" className="h-full">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5">
                    <EnvironmentOutlined />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 mb-1">Address</div>
                    <div className="text-gray-900">{field.address}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5">
                    <TeamOutlined />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 mb-1">Field type</div>
                    <div className="text-gray-900 font-medium">
                      {field.sportTypeId?.name || 'Unknown'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5">
                    <DollarOutlined />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 mb-1">Rental price</div>
                    <div className="text-gray-900 font-medium">
                      {field.pricePerHour ? `${field.pricePerHour.toLocaleString('vi-VN')} VND/hour` : 'Free'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5">
                    <ClockCircleOutlined />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 mb-1">Operating Hours</div>
                    <div className="text-gray-900">
                      {field.openingHours?.start} - {field.openingHours?.end}
                    </div>
                  </div>
                </div>

                {field.description && (
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5">
                      <EyeOutlined />
                    </div>
                    <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 mb-1">Description</div>
                      <div className="text-gray-900">{field.description}</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Management Information" className="h-full">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5">
                    <CalendarOutlined />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 mb-1">Created at</div>
                    <div className="text-gray-900">{formatDate(field.createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5">
                    <CalendarOutlined />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 mb-1">Last updated</div>
                    <div className="text-gray-900">{formatDate(field.updatedAt)}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5">
                    <ToolOutlined />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 mb-1">ID</div>
                    <div className="text-gray-900 font-mono text-sm">#{field._id}</div>
                  </div>
                </div>

                {field.managedBy && (
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5">
                      <TeamOutlined />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-500 mb-1">Managed by</div>
                      <div className="text-gray-900">{field.managedBy.name}</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Thumbnail Gallery */}
      
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t bg-gray-50 px-6 py-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
        {onBookField && (
          <button
            onClick={onBookField}
            disabled={field.status !== 'active'}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              field.status === 'active'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Book now
          </button>
        )}
      </div>
    </Modal>
  );
};

export default FieldDetailModal;