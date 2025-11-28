import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  message,
  Spin,
} from 'antd';
import { EditOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const EditFieldModal = ({ visible, onCancel, onUpdate, initialValues, loading = false }) => {
  const [form] = Form.useForm();
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedPurpose, setSelectedPurpose] = useState('rental');
  const [sportTypes, setSportTypes] = useState([]);

  // Fetch sport types
  useEffect(() => {
    fetchSportTypes();
  }, []);

  const fetchSportTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/season/sport-types', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.data) {
        setSportTypes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sport types:', error);
    }
  };

  useEffect(() => {
    if (visible && initialValues) {
      // Set form values
      form.setFieldsValue({
        name: initialValues.name,
        fieldNumber: initialValues.fieldNumber,
        address: initialValues.address,
        location: initialValues.location,
        sportTypeId: initialValues.sportTypeId?._id || initialValues.sportTypeId,
        purpose: initialValues.purpose,
        pricePerHour: initialValues.pricePerHour,
        openingHours: {
          start: initialValues.openingHours?.start,
          end: initialValues.openingHours?.end,
        },
        status: initialValues.status,
        description: initialValues.description,
      });
      setSelectedPurpose(initialValues.purpose || 'rental');

      // Set existing images as previews
      if (initialValues.images && initialValues.images.length > 0) {
        const existingPreviews = initialValues.images.map((imageUrl, index) => ({
          preview: imageUrl,
          name: `existing-image-${index}.jpg`,
          isExisting: true,
        }));
        setImagePreviews(existingPreviews);
        setImageFiles([]);
      } else {
        setImagePreviews([]);
        setImageFiles([]);
      }
    }
  }, [visible, initialValues, form]);

  // Handle image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length + imagePreviews.filter(p => p.isExisting).length > 5) {
      message.error('Tối đa 5 ảnh!');
      return;
    }

    const newFiles = [];
    const newPreviews = [];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        newFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({
            preview: e.target.result,
            name: file.name,
            isExisting: false
          });
          if (newPreviews.length === files.length) {
            setImageFiles(prev => [...prev, ...newFiles]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Remove image
  const removeImage = (index) => {
    const imageToRemove = imagePreviews[index];
    
    if (imageToRemove.isExisting) {
      // Remove existing image
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove new image
      const newImageIndex = imagePreviews.slice(0, index).filter(p => !p.isExisting).length;
      setImageFiles(prev => prev.filter((_, i) => i !== newImageIndex));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (loading) return;
    
    form
      .validateFields()
      .then((values) => {
        // Tạo FormData để gửi file
        const formData = new FormData();
        
        // Thêm các field text
        formData.append('name', values.name);
        formData.append('fieldNumber', values.fieldNumber);
        formData.append('address', values.address);
        formData.append('location', values.location || '');
        formData.append('sportTypeId', values.sportTypeId);
        formData.append('purpose', values.purpose);
        formData.append('openingHours', JSON.stringify(values.openingHours));
        formData.append('status', values.status);
        formData.append('description', values.description || '');
        
        // Thêm giá thuê nếu là sân rental
        if (values.purpose === 'rental' && values.pricePerHour) {
          const priceValue = Number(values.pricePerHour);
          console.log('Edit - Price per hour value:', priceValue, 'Type:', typeof priceValue);
          formData.append('pricePerHour', priceValue);
        } else if (values.purpose === 'event') {
          // Sân event không cần giá thuê (set default 1000 VNĐ)
          formData.append('pricePerHour', 1000);
        }
        
        // Thêm file ảnh mới vào FormData
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });

        // Thêm thông tin về ảnh existing cần giữ lại
        const existingImages = imagePreviews
          .filter(preview => preview.isExisting)
          .map(preview => preview.preview);
        
        if (existingImages.length > 0) {
          formData.append('existingImages', JSON.stringify(existingImages));
        }
        
        onUpdate(formData);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    if (!loading) {
      form.resetFields();
      setImageFiles([]);
      setImagePreviews([]);
      setSelectedPurpose('rental');
      onCancel();
    }
  };



  return (
    <Modal
      title="Chỉnh sửa sân bóng"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Cập nhật"
      cancelText="Hủy"
      width={1200}
      destroyOnClose
      confirmLoading={loading}
      okButtonProps={{ disabled: loading }}
      cancelButtonProps={{ disabled: loading }}
      style={{ top: 20 }}
      bodyStyle={{ 
        maxHeight: '80vh', 
        overflowY: 'auto',
        padding: '24px'
      }}
    >
      <Spin spinning={loading} tip="Đang cập nhật sân bóng...">
        <Form
          form={form}
          layout="vertical"
        >
        <Row gutter={24}>
          {/* Cột trái - Tất cả các input nhập liệu */}
          <Col span={12}>
            <div className="space-y-6">
              {/* Tên sân và số sân - 1 hàng */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Tên sân bóng"
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên sân bóng!' },
                      { min: 3, message: 'Tên sân phải có ít nhất 3 ký tự!' },
                    ]}
                  >
                    <Input placeholder="Nhập tên sân bóng..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fieldNumber"
                    label="Số sân"
                    rules={[{ required: true, message: 'Vui lòng nhập số sân!' }]}
                  >
                    <Input placeholder="VD: Sân 1, Sân 2..." />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input placeholder="Nhập địa chỉ chi tiết..." />
              </Form.Item>

              <Form.Item
                name="location"
                label="Khu vực"
              >
                <Input placeholder="VD: Quận 1, TP.HCM..." />
              </Form.Item>

              <Form.Item
                name="sportTypeId"
                label="Loại bóng"
                rules={[{ required: true, message: 'Vui lòng chọn loại bóng!' }]}
                validateTrigger={['onChange', 'onBlur']}
                hasFeedback
              >
                <Select 
                  placeholder="Chọn loại bóng (5, 7, 11 người)"
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  {sportTypes.map(sport => (
                    <Option key={sport._id} value={sport._id}>
                      {sport.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Purpose and Rental Price - 1 row */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="purpose"
                    label="Purpose"
                    rules={[{ required: true, message: 'Please select a purpose!' }]}
                    validateTrigger={['onChange', 'onBlur']}
                    hasFeedback
                  >
                    <Select 
                      placeholder="Select field purpose"
                      size="large"
                      style={{ borderRadius: '8px' }}
                      onChange={(value) => setSelectedPurpose(value)}
                    >
                      <Option value="event">
                        <div className="flex items-center gap-2">
                          <span>🏆</span>
                          <span>Tournament Field</span>
                        </div>
                      </Option>
                      <Option value="rental">
                        <div className="flex items-center gap-2">
                          <span>💰</span>
                          <span>Rental Field</span>
                        </div>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {selectedPurpose === 'rental' && (
                    <Form.Item
                      name="pricePerHour"
                      label="Rental Price (VND/hour)"
                      rules={[
                        { required: true, message: 'Please enter rental price!' },
                        { 
                          type: 'number', 
                          min: 1000, 
                          message: 'Minimum rental price is 1,000 VND!' 
                        },
                        { 
                          type: 'number', 
                          max: 1000000, 
                          message: 'Maximum rental price is 1,000,000 VND!' 
                        }
                      ]}
                      validateTrigger={['onChange', 'onBlur']}
                      hasFeedback
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Enter rental price..."
                        min={1000}
                        step={10000}
                        precision={0}
                        addonAfter="VND"
                      />
                    </Form.Item>
                  )}
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['openingHours', 'start']}
                    label="Opening Time"
                    rules={[{ required: true, message: 'Please enter opening time!' }]}
                  >
                    <Input type="time" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['openingHours', 'end']}
                    label="Closing Time"
                    rules={[{ required: true, message: 'Please enter closing time!' }]}
                  >
                    <Input type="time" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select a status!' }]}
                validateTrigger={['onChange', 'onBlur']}
                hasFeedback
              >
                <Select 
                  placeholder="Select field status"
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  <Option value="active">
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Active</span>
                    </div>
                  </Option>
                  <Option value="maintenance">
                    <div className="flex items-center gap-2">
                      <span>🔧</span>
                      <span>Maintenance</span>
                    </div>
                  </Option>
                  <Option value="inactive">
                    <div className="flex items-center gap-2">
                      <span>❌</span>
                      <span>Inactive</span>
                    </div>
                  </Option>
                </Select>
              </Form.Item>
            </div>
          </Col>

          {/* Cột phải - Chỉ có ảnh và mô tả */}
          <Col span={12}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📸</span>
                  Hình ảnh sân bóng
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-700 font-medium">
                      Hình ảnh sân bóng
                      <span className="text-gray-500 font-normal ml-2">
                        ({imagePreviews.length}/5)
                      </span>
                    </label>
                    {imagePreviews.length >= 5 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Đã đủ 5 ảnh
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      id="edit-field-images"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only" // ẩn input gốc, chỉ để label gọi
                    />

                    <label
                      htmlFor="edit-field-images"
                      className="group cursor-pointer block w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-center bg-gray-50/50"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors duration-200">
                          <UploadOutlined className="text-gray-500 group-hover:text-blue-500 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                            {imagePreviews.length === 0
                              ? 'Tải lên hình ảnh sân bóng'
                              : 'Thêm ảnh khác'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Kéo thả hoặc click để chọn • PNG, JPG tối đa 5MB
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Image Preview Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Ảnh đã chọn</h4>

                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors shadow-sm">
                              <img
                                src={preview.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>

                            {/* Nút xóa ảnh */}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100"
                              title="Xóa ảnh"
                            >
                              ×
                            </button>

                            {/* Index ảnh */}
                            <div className="absolute top-1 left-1 w-4 h-4 bg-black/50 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>

                            {/* Tag "Cũ" nếu ảnh đã tồn tại */}
                            {preview.isExisting && (
                              <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-full">
                                Cũ
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📝</span>
                  Mô tả
                </h3>
                
                <Form.Item
                  name="description"
                  label="Mô tả chi tiết"
                >
                  <TextArea
                    rows={6}
                    placeholder="Nhập mô tả chi tiết về sân bóng..."
                  />
                </Form.Item>
              </div>
            </div>
          </Col>
        </Row>

        </Form>
      </Spin>
    </Modal>
  );
};

export default EditFieldModal;