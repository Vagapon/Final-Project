import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Tag,
  Button,
  message,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const CreateFieldModal = ({ visible, onCancel, onCreate }) => {
  const [form] = Form.useForm();
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedPurpose, setSelectedPurpose] = useState('rental');

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Tạo FormData để gửi file
      const formData = new FormData();
      
      // Thêm các field text
      formData.append('name', values.name);
      formData.append('fieldNumber', values.fieldNumber);
      formData.append('address', values.address);
      formData.append('location', values.location || '');
      formData.append('purpose', values.purpose);
      // Xử lý openingHours dưới dạng JSON string
      if (values.openingHours?.start && values.openingHours?.end) {
        formData.append('openingHours', JSON.stringify({
          start: values.openingHours.start,
          end: values.openingHours.end
        }));
      }
      formData.append('status', values.status);
      formData.append('description', values.description || '');
      
      // Thêm giá thuê nếu là sân rental
      if (values.purpose === 'rental') {
        if (!values.pricePerHour) {
          throw new Error('Vui lòng nhập giá thuê cho sân rental!');
        }
        const priceValue = Number(values.pricePerHour);
        console.log('Price per hour value:', priceValue, 'Type:', typeof priceValue);
        
        // Validation giá thuê ở frontend
        if (priceValue < 200000) {
          throw new Error('Giá thuê tối thiểu 200,000 VNĐ!');
        }
        if (priceValue > 1000000) {
          throw new Error('Giá thuê không được vượt quá 1,000,000 VNĐ!');
        }
        
        formData.append('pricePerHour', priceValue);
      }
      // Sân event không cần giá thuê
      
      // Thêm file ảnh (sử dụng cách giống create staff)
      imageFiles.forEach((file, index) => {
        formData.append('images', file);
      });

      // Gọi onCreate và đợi kết quả
      await onCreate(formData);
      
      // Reset form chỉ khi tạo thành công
      form.resetFields();
      setImageFiles([]);
      setImagePreviews([]);
      setSelectedPurpose('rental');
    } catch (info) {
      console.log('Validate Failed:', info);
      
      // Hiển thị lỗi validation cho user
      if (info.errorFields) {
        // Lỗi validation từ Ant Design Form
        const firstError = info.errorFields[0];
        if (firstError && firstError.errors && firstError.errors[0]) {
          message.error(firstError.errors[0]);
        }
      } else if (info.message) {
        // Lỗi custom từ validation logic
        message.error(info.message);
      } else {
        message.error('Có lỗi xảy ra khi tạo sân. Vui lòng kiểm tra lại thông tin!');
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageFiles([]);
    setImagePreviews([]);
    setSelectedPurpose('rental');
    onCancel();
  };

  // Handle image file selection (similar to create staff)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      message.error('Chỉ được upload tối đa 5 ảnh!');
      return;
    }

    // Validate each file
    const validFiles = [];
    const newPreviews = [...imagePreviews];

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        message.error(`${file.name} không phải file ảnh!`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error(`${file.name} quá lớn! Tối đa 5MB.`);
        return;
      }
      
      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          file: file,
          preview: e.target.result,
          name: file.name
        });
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    setImageFiles([...imageFiles, ...validFiles]);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };



  return (
    <Modal
      title="Thêm sân bóng mới"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Tạo sân"
      cancelText="Hủy" 
      width={1200}
      destroyOnClose
      style={{ top: 20 }}
      bodyStyle={{ 
        maxHeight: '80vh', 
        overflowY: 'auto',
        padding: '24px'
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'active',
          purpose: 'rental',
        }}
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
                      { max: 50, message: 'Tên sân không được quá 50 ký tự!' },
                      { pattern: /^[a-zA-ZÀ-ỹ0-9\s]+$/, message: 'Tên sân chỉ được chứa chữ cái, số và khoảng trắng!' }
                    ]}
                    validateTrigger={['onChange', 'onBlur']}
                    hasFeedback
                  >
                    <Input 
                      placeholder="Nhập tên sân bóng..." 
                      showCount
                      maxLength={50}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fieldNumber"
                    label="Số sân"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số sân!' },
                      { max: 20, message: 'Số sân không được quá 20 ký tự!' }
                    ]}
                    validateTrigger={['onChange', 'onBlur']}
                    hasFeedback
                  >
                    <Input 
                      placeholder="VD: Sân 1, Sân 2..." 
                      showCount
                      maxLength={20}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[
                  { required: true, message: 'Vui lòng nhập địa chỉ!' },
                  { min: 10, message: 'Địa chỉ phải có ít nhất 10 ký tự!' },
                  { max: 200, message: 'Địa chỉ không được quá 200 ký tự!' }
                ]}
                validateTrigger={['onChange', 'onBlur']}
                hasFeedback
              >
                <Input 
                  placeholder="Nhập địa chỉ chi tiết..." 
                  showCount
                  maxLength={200}
                />
              </Form.Item>

              <Form.Item
                name="location"
                label="Khu vực"
                rules={[
                  { max: 100, message: 'Khu vực không được quá 100 ký tự!' }
                ]}
                validateTrigger={['onChange', 'onBlur']}
              >
                <Input 
                  placeholder="VD: Quận 1, TP.HCM..." 
                  showCount
                  maxLength={100}
                />
              </Form.Item>

              {/* Mục đích sử dụng và giá thuê - 1 hàng */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="purpose"
                    label="Mục đích sử dụng"
                    rules={[{ required: true, message: 'Vui lòng chọn mục đích sử dụng!' }]}
                    validateTrigger={['onChange', 'onBlur']}
                    hasFeedback
                  >
                    <Select 
                      placeholder="Chọn mục đích sử dụng"
                      size="large"
                      style={{ borderRadius: '8px' }}
                      onChange={(value) => setSelectedPurpose(value)}
                    >
                      <Option value="event">
                        <div className="flex items-center gap-2">
                          <span>🏆</span>
                          <span>Sân giải đấu</span>
                        </div>
                      </Option>
                      <Option value="rental">
                        <div className="flex items-center gap-2">
                          <span>💰</span>
                          <span>Sân thuê</span>
                        </div>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {selectedPurpose === 'rental' && (
                    <Form.Item
                      name="pricePerHour"
                      label="Giá thuê (VNĐ/giờ)"
                      rules={[
                        { required: true, message: 'Vui lòng nhập giá thuê!' },
                        { 
                          type: 'number', 
                          min: 200000, 
                          message: 'Giá thuê tối thiểu 200,000 VNĐ!' 
                        },
                        { 
                          type: 'number', 
                          max: 1000000, 
                          message: 'Giá thuê không được vượt quá 1,000,000 VNĐ!' 
                        }
                      ]}
                      validateTrigger={['onChange', 'onBlur']}
                      hasFeedback
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập giá thuê..."
                        min={200000}
                        step={10000}
                        precision={0}
                        addonAfter="VNĐ"
                      />
                    </Form.Item>
                  )}
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['openingHours', 'start']}
                    label="Giờ mở cửa"
                    rules={[
                      { required: true, message: 'Vui lòng nhập giờ mở cửa!' }
                    ]}
                    validateTrigger={['onChange', 'onBlur']}
                    hasFeedback
                  >
                    <Input type="time" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['openingHours', 'end']}
                    label="Giờ đóng cửa"
                    rules={[
                      { required: true, message: 'Vui lòng nhập giờ đóng cửa!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const startTime = getFieldValue(['openingHours', 'start']);
                          if (startTime && value) {
                            const start = new Date(`2000-01-01 ${startTime}`);
                            const end = new Date(`2000-01-01 ${value}`);
                            if (start >= end) {
                              return Promise.reject(new Error('Giờ đóng cửa phải sau giờ mở cửa!'));
                            }
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                    validateTrigger={['onChange', 'onBlur']}
                    hasFeedback
                  >
                    <Input type="time" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                validateTrigger={['onChange', 'onBlur']}
                hasFeedback
              >
                <Select 
                  placeholder="Chọn trạng thái sân"
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  <Option value="active">
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Hoạt động</span>
                    </div>
                  </Option>
                  <Option value="maintenance">
                    <div className="flex items-center gap-2">
                      <span>🔧</span>
                      <span>Bảo trì</span>
                    </div>
                  </Option>
                  <Option value="inactive">
                    <div className="flex items-center gap-2">
                      <span>❌</span>
                      <span>Ngừng hoạt động</span>
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
                      <span className="text-gray-500 font-normal ml-2">({imageFiles.length}/5)</span>
                    </label>
                    {imageFiles.length >= 5 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Đã đủ 5 ảnh
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      id="field-images"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only" // ẩn input gốc, chỉ để label gọi
                    />
                    <label
                      htmlFor="field-images"
                      className="group cursor-pointer block w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-center bg-gray-50/50"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors duration-200">
                          <UploadOutlined className="text-gray-500 group-hover:text-blue-500 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                            {imageFiles.length === 0 ? 'Tải lên hình ảnh sân bóng' : 'Thêm ảnh khác'}
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
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100"
                              title="Xóa ảnh"
                            >
                              ×
                            </button>
                            <div className="absolute top-1 left-1 w-4 h-4 bg-black/50 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
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
    </Modal>
  );
};

export default CreateFieldModal;