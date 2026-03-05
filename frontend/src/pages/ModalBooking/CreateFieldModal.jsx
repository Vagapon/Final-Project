import React, { useState, useEffect, useMemo } from 'react';
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
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

import { getApiUrl } from '../../utils/apiConfig';

const CreateFieldModal = ({ visible, onCancel, onCreate }) => {
  const [form] = Form.useForm();
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedPurpose, setSelectedPurpose] = useState('rental');
  const [sportTypes, setSportTypes] = useState([]);
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);

  // Fetch sport types when modal opens
  useEffect(() => {
    if (visible) {
      fetchSportTypes();
    }
  }, [visible]);

  const fetchSportTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${getApiUrl()}/season/sport-types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.data) {
        setSportTypes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sport types:', error);
      message.error('Failed to load field types');
    }
  };

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
      formData.append('sportTypeId', values.sportTypeId);
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
      if (values.latitude) {
        formData.append('latitude', values.latitude);
      }
      if (values.longitude) {
        formData.append('longitude', values.longitude);
      }
      
      // Thêm giá thuê nếu là sân rental
      if (values.purpose === 'rental') {
        if (!values.pricePerHour) {
          throw new Error('Please enter rental price for this field!');
        }
        const priceValue = Number(values.pricePerHour);
        console.log('Price per hour value:', priceValue, 'Type:', typeof priceValue);
        
        // Validation giá thuê ở frontend
        if (priceValue < 1000) {
          throw new Error('Minimum rental price is 1,000 VND!');
        }
        if (priceValue > 1000000) {
          throw new Error('Rental price cannot exceed 1,000,000 VND!');
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
      
      // Show validation error to user
      if (info.errorFields) {
        // Validation errors from Ant Design Form
        const firstError = info.errorFields[0];
        if (firstError && firstError.errors && firstError.errors[0]) {
          message.error(firstError.errors[0]);
        }
      } else if (info.message) {
        // Custom validation error
        message.error(info.message);
      } else {
        message.error('Failed to create field. Please double-check the information.');
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageFiles([]);
    setImagePreviews([]);
    setSelectedPurpose('rental');
    setAddressSuggestions([]);
    setAddressQuery('');
    onCancel();
  };

  // Debounced fetch for address suggestions using Nominatim
  useEffect(() => {
    if (!addressQuery || addressQuery.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setAddressLoading(true);
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            addressQuery
          )}&addressdetails=1&limit=5`,
          {
            headers: { 'Accept-Language': 'en' },
            signal: controller.signal,
          }
        );
        const data = await resp.json();
        const suggestions =
          Array.isArray(data) && data.length
            ? data.map((item) => ({
                label: item.display_name,
                lat: item.lat,
                lon: item.lon,
              }))
            : [];
        setAddressSuggestions(suggestions);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Address lookup error:', err);
        }
      } finally {
        setAddressLoading(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [addressQuery]);

  const selectedLat = Form.useWatch('latitude', form);
  const selectedLon = Form.useWatch('longitude', form);

  const mapUrl = useMemo(() => {
    if (!selectedLat || !selectedLon) return null;
    const latNum = parseFloat(selectedLat);
    const lonNum = parseFloat(selectedLon);
    if (Number.isNaN(latNum) || Number.isNaN(lonNum)) return null;
    const delta = 0.01;
    const bbox = `${lonNum - delta},${latNum - delta},${lonNum + delta},${latNum + delta}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
      bbox
    )}&layer=mapnik&marker=${encodeURIComponent(latNum)},${encodeURIComponent(lonNum)}`;
  }, [selectedLat, selectedLon]);

  const handleSelectAddress = (suggestion) => {
    setAddressQuery(suggestion.label);
    setAddressSuggestions([]);
    form.setFieldsValue({
      address: suggestion.label,
      latitude: suggestion.lat,
      longitude: suggestion.lon,
    });
  };

  // Handle image file selection (similar to create staff)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      message.error('You can upload at most 5 images!');
      return;
    }

    // Validate each file
    const validFiles = [];
    const newPreviews = [...imagePreviews];

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        message.error(`${file.name} is not an image file!`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error(`${file.name} is too large! Max 5MB.`);
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
      title="Add new field"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Create field"
      cancelText="Cancel" 
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
          {/* Left column - all inputs */}
          <Col span={12}>
            <div className="space-y-6">
              {/* Tên sân và số sân - 1 hàng */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Field name"
                    rules={[
                      { required: true, message: 'Please enter a field name!' },
                      { min: 3, message: 'Field name must be at least 3 characters!' },
                      { max: 50, message: 'Field name cannot exceed 50 characters!' },
                      { pattern: /^[a-zA-ZÀ-ỹ0-9\s]+$/, message: 'Field name can only include letters, numbers, and spaces!' }
                    ]}
                    validateTrigger={['onChange', 'onBlur']}
                    hasFeedback
                  >
                    <Input 
                      placeholder="Enter field name..." 
                      showCount
                      maxLength={50}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fieldNumber"
                    label="Field number"
                    rules={[
                      { required: true, message: 'Please enter field number!' },
                      { max: 20, message: 'Field number cannot exceed 20 characters!' }
                    ]}
                    validateTrigger={['onChange', 'onBlur']}
                    hasFeedback
                  >
                    <Input 
                      placeholder="e.g. Field 1, Field 2..." 
                      showCount
                      maxLength={20}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="relative">
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[
                    { required: true, message: 'Please enter address!' },
                    { min: 10, message: 'Address must be at least 10 characters!' },
                    { max: 200, message: 'Address cannot exceed 200 characters!' }
                  ]}
                  validateTrigger={['onChange', 'onBlur']}
                  hasFeedback
                >
                  <Input 
                    placeholder="Enter full address..." 
                    showCount
                    maxLength={200}
                    value={addressQuery}
                    onChange={(e) => {
                      setAddressQuery(e.target.value);
                      form.setFieldsValue({ address: e.target.value });
                    }}
                  />
                </Form.Item>
                {addressQuery && (
                  <div className="absolute left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-sm max-h-60 overflow-auto">
                    {addressLoading && (
                      <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
                    )}
                    {!addressLoading && addressSuggestions.length === 0 && addressQuery.length >= 3 && (
                      <div className="px-3 py-2 text-sm text-gray-500">No results</div>
                    )}
                    {addressSuggestions.map((s) => (
                      <button
                        type="button"
                        key={`${s.lat}-${s.lon}-${s.label}`}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                        onClick={() => handleSelectAddress(s)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Form.Item name="latitude" label="Latitude" hidden>
                <Input />
              </Form.Item>
              <Form.Item name="longitude" label="Longitude" hidden>
                <Input />
              </Form.Item>

              <Form.Item
                name="location"
                label="Area"
                rules={[
                  { max: 100, message: 'Area cannot exceed 100 characters!' }
                ]}
                validateTrigger={['onChange', 'onBlur']}
              >
                <Input 
                  placeholder="e.g. District 1, HCMC..." 
                  showCount
                  maxLength={100}
                />
              </Form.Item>

              <Form.Item
                name="sportTypeId"
                label="Sport type"
                rules={[{ required: true, message: 'Please select a sport type!' }]}
                validateTrigger={['onChange', 'onBlur']}
                hasFeedback
              >
                <Select 
                  placeholder="Choose sport type (5, 7, 11 players)"
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

              {/* Purpose and rental price - single row */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="purpose"
                    label="Purpose"
                    rules={[{ required: true, message: 'Please select purpose!' }]}
                    validateTrigger={['onChange', 'onBlur']}
                    hasFeedback
                  >
                    <Select 
                      placeholder="Choose purpose"
                      size="large"
                      style={{ borderRadius: '8px' }}
                      onChange={(value) => setSelectedPurpose(value)}
                    >
                      <Option value="event">
                        <div className="flex items-center gap-2">
                          <span>🏆</span>
                          <span>Tournament field</span>
                        </div>
                      </Option>
                      <Option value="rental">
                        <div className="flex items-center gap-2">
                          <span>💰</span>
                          <span>Rental field</span>
                        </div>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {selectedPurpose === 'rental' && (
                    <Form.Item
                      name="pricePerHour"
                      label="Rental price (VND/hour)"
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
                          message: 'Rental price cannot exceed 1,000,000 VND!' 
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
                    label="Opening time"
                    rules={[
                      { required: true, message: 'Please enter opening time!' }
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
                    label="Closing time"
                    rules={[
                      { required: true, message: 'Please enter closing time!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const startTime = getFieldValue(['openingHours', 'start']);
                          if (startTime && value) {
                            const start = new Date(`2000-01-01 ${startTime}`);
                            const end = new Date(`2000-01-01 ${value}`);
                            if (start >= end) {
                              return Promise.reject(new Error('Closing time must be after opening time!'));
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

          {/* Right column - images, description, map */}
          <Col span={12}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📸</span>
                  Field images
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-700 font-medium">
                      Field images
                      <span className="text-gray-500 font-normal ml-2">({imageFiles.length}/5)</span>
                    </label>
                    {imageFiles.length >= 5 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        5 images limit reached
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
                      className="sr-only"
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
                            {imageFiles.length === 0 ? 'Upload field images' : 'Add more images'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Drag & drop or click to select • PNG, JPG up to 5MB
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Image Preview Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Selected images</h4>
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
                              title="Delete image"
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
                  Description
                </h3>
                
                <Form.Item
                  name="description"
                  label="Detailed description"
                >
                  <TextArea
                    rows={6}
                    placeholder="Enter detailed description..."
                  />
                </Form.Item>
              </div>

              {mapUrl && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-800">Map preview</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      title="Field location map"
                      src={mapUrl}
                      width="100%"
                      height="240"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateFieldModal;