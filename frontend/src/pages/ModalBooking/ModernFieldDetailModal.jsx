import React, { useState, useEffect } from 'react';
import {
  Modal,
  Tag,
  Row,
  Col,
  Card,
  Button,
  Rate,
  Divider,
  Spin,
  message
} from 'antd';
import {
  MapPin,
  Clock,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Wifi,
  Car,
  Coffee,
  Shield,
  Heart,
  Share2,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';

const ModernFieldDetailModal = ({ 
  visible, 
  onCancel, 
  field, 
  onBookField, 
  loading = false 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  if (!field) return null;
  
  const originalImages = field.images && field.images.length > 0 ? field.images : [];
  
  // Tạo array 5 ảnh với placeholder nếu thiếu
  const createImageArray = () => {
    const images = [...originalImages];
    while (images.length < 5) {
      images.push(null); // null sẽ được xử lý như placeholder
    }
    return images.slice(0, 5); // Chỉ lấy 5 ảnh đầu
  };
  
  const images = createImageArray();

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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { 
          color: 'green', 
          text: 'Hoạt động', 
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700'
        };
      case 'maintenance':
        return { 
          color: 'orange', 
          text: 'Bảo trì', 
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700'
        };
      case 'inactive':
        return { 
          color: 'red', 
          text: 'Ngừng hoạt động', 
          icon: <XCircle className="w-4 h-4" />,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700'
        };
      default:
        return { 
          color: 'default', 
          text: status, 
          icon: null,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700'
        };
    }
  };

  const getPurposeConfig = (purpose) => {
    switch (purpose) {
      case 'event':
        return { 
          color: 'blue', 
          text: 'Sân giải đấu',
          icon: '🏆',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700'
        };
      case 'rental':
        return { 
          color: 'green', 
          text: 'Sân thuê',
          icon: '💰',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700'
        };
      default:
        return { 
          color: 'default', 
          text: purpose,
          icon: '⚽',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700'
        };
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time;
  };

  const amenities = [
    { icon: <Wifi className="w-5 h-5" />, name: 'Wifi', available: true },
    { icon: <Car className="w-5 h-5" />, name: 'Bãi đỗ xe máy', available: true },
    { icon: <Coffee className="w-5 h-5" />, name: 'Trà đá', available: true },
    { icon: <Coffee className="w-5 h-5" />, name: 'Nước uống', available: true },
    { icon: <Car className="w-5 h-5" />, name: 'Bãi đỗ xe oto', available: true },
    { icon: <Coffee className="w-5 h-5" />, name: 'Căng tin', available: true },
    { icon: <Coffee className="w-5 h-5" />, name: 'Đồ ăn', available: true }
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    message.success(isLiked ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: field.name,
        text: field.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép link');
    }
  };

  const handleImageClick = (index) => {
    // Chỉ mở modal nếu có ảnh thật tại vị trí đó
    if (originalImages[index]) {
      setSelectedImageIndex(index);
      setShowImageModal(true);
    }
  };

  const nextImageModal = () => {
    if (originalImages.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % originalImages.length);
    }
  };

  const prevImageModal = () => {
    if (originalImages.length > 1) {
      setSelectedImageIndex((prev) => (prev - 1 + originalImages.length) % originalImages.length);
    }
  };

  const statusConfig = getStatusConfig(field.status);
  const purposeConfig = getPurposeConfig(field.purpose);

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      destroyOnClose
      className="modern-field-detail-modal"
      styles={{
        body: {
          padding: 0,
          maxHeight: '90vh',
          overflowY: 'auto'
        }
      }}
      centered
    >
      <Spin spinning={loading} tip="Đang tải thông tin sân...">
        <div className="relative">
          {/* Header Section */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {field.name || 'Sân bóng đá The One Gamuda'}
                </h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {field.address || 'Đường số 2 Gamuda Gardens, Phường Trần Phú, Quận Hoàng Mai, Hà Nội'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700">4/5</span>
                  <span className="text-sm text-gray-500">(1 Đánh giá)</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleShare}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={handleLike}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isLiked 
                        ? 'bg-red-100 text-red-500' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                  <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <AlertCircle className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex">
            {/* Left Column - Image Gallery */}
            <div className="flex-1 p-6">
              <div className="grid grid-cols-3 grid-rows-3 gap-2 h-96">
                {/* Main Image - Top Left Wide */}
                <div className="col-span-2 row-span-2 relative overflow-hidden rounded-lg group">
                  {images[0] ? (
                    <img 
                      src={images[0]} 
                      alt={`${field.name} - 1`}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                      onClick={() => handleImageClick(0)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <MapPin className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-medium">Sân bóng đá</p>
                      </div>
                    </div>
                  )}
                  {/* Hover overlay - chỉ hiện khi có ảnh */}
                  {images[0] && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                          <ExternalLink className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Right - First Small Image */}
                <div className="col-span-1 row-span-1 relative overflow-hidden rounded-lg group">
                  {images[1] ? (
                    <img 
                      src={images[1]} 
                      alt={`${field.name} - 2`}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                      onClick={() => handleImageClick(1)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  )}
                  {/* Hover overlay - chỉ hiện khi có ảnh */}
                  {images[1] && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                          <ExternalLink className="w-3 h-3 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Right - Second Small Image */}
                <div className="col-span-1 row-span-1 relative overflow-hidden rounded-lg group">
                  {images[2] ? (
                    <img 
                      src={images[2]} 
                      alt={`${field.name} - 3`}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                      onClick={() => handleImageClick(2)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  )}
                  {/* Hover overlay - chỉ hiện khi có ảnh */}
                  {images[2] && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                          <ExternalLink className="w-3 h-3 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Left - Wide Image */}
                <div className="col-span-2 row-span-1 relative overflow-hidden rounded-lg group">
                  {images[3] ? (
                    <img 
                      src={images[3]} 
                      alt={`${field.name} - 4`}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                      onClick={() => handleImageClick(3)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  )}
                  {/* Hover overlay - chỉ hiện khi có ảnh */}
                  {images[3] && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                          <ExternalLink className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Right - Portrait Image */}
                <div className="col-span-1 row-span-1 relative overflow-hidden rounded-lg group">
                  {images[4] ? (
                    <>
                      <img 
                        src={images[4]} 
                        alt={`${field.name} - 5`}
                        className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                        onClick={() => handleImageClick(4)}
                      />
                      {/* View More Button */}
                      {originalImages.length > 5 && (
                        <div className="absolute bottom-2 right-2">
                          <button 
                            className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1 hover:bg-black/70 transition-colors"
                            onClick={() => setShowImageModal(true)}
                          >
                            <span>Xem {originalImages.length} ảnh</span>
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  )}
                  {/* Hover overlay - chỉ hiện khi có ảnh */}
                  {images[4] && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                          <ExternalLink className="w-3 h-3 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Right Column - Field Information */}
            <div className="w-80 bg-gray-50 p-6">
              {/* Field Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-5 bg-orange-500 rounded-full mr-2"></span>
                  Thông tin sân
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {formatTime(field.openingHours?.start) || '6h'} - {formatTime(field.openingHours?.end) || '23h'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {field.fieldNumber || '3'} Sân
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {formatPrice(field.pricePerHour) || '800.000 ₫'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {formatPrice(field.pricePerHour) || '800.000 ₫'} (giờ vàng)
                    </span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-5 bg-orange-500 rounded-full mr-2"></span>
                  Dịch vụ tiện ích
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.slice(0, 6).map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-5 h-5 text-gray-500">
                        {amenity.icon}
                      </div>
                      <span className="text-sm text-gray-700">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <Button
                  icon={<Heart className="w-4 h-4" />}
                  onClick={handleLike}
                  className={`${isLiked ? 'text-red-500 border-red-500' : 'text-gray-600 border-gray-300'}`}
                >
                  {isLiked ? 'Đã yêu thích' : 'Yêu thích'}
                </Button>
                <Button
                  icon={<Share2 className="w-4 h-4" />}
                  onClick={handleShare}
                  className="text-gray-600 border-gray-300"
                >
                  Chia sẻ
                </Button>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={onCancel}
                  className="px-6 py-2 text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  Đóng
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={onBookField}
                  disabled={field.status !== 'active'}
                  className={`px-8 py-2 h-auto ${
                    field.status === 'active'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {field.status === 'active' ? 'Đặt sân ngay' : 'Không thể đặt'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Spin>

      {/* Image Modal for Zoom */}
      <Modal
        title={null}
        open={showImageModal}
        onCancel={() => setShowImageModal(false)}
        footer={null}
        width="90vw"
        centered
        className="image-zoom-modal"
        styles={{
          body: {
            padding: 0,
            maxHeight: '90vh',
            overflow: 'hidden'
          }
        }}
      >
        <div className="relative bg-black">
          {/* Main Image */}
          <div className="relative h-[80vh] flex items-center justify-center">
            {originalImages.length > 0 && originalImages[selectedImageIndex] && (
              <img 
                src={originalImages[selectedImageIndex]} 
                alt={`${field.name} - ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}
            
            {/* Navigation Arrows */}
            {originalImages.length > 1 && (
              <>
                <button
                  onClick={prevImageModal}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10 group"
                >
                  <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={nextImageModal}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10 group"
                >
                  <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10"
            >
              <XCircle className="w-6 h-6" />
            </button>

            {/* Image Counter */}
            {originalImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-white text-sm font-medium">
                  {selectedImageIndex + 1} / {originalImages.length}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {originalImages.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4">
              <div className="flex space-x-2 justify-center overflow-x-auto">
                {originalImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                      index === selectedImageIndex 
                        ? 'ring-2 ring-white scale-110' 
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${field.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Modal>
  );
};

export default ModernFieldDetailModal;
