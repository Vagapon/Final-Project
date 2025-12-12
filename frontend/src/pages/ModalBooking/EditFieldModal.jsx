import React, { useEffect, useState, useMemo } from 'react';
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
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);

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
        latitude: initialValues.latitude,
        longitude: initialValues.longitude,
      });
      setAddressQuery(initialValues.address || '');
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
      message.error('Maximum 5 images allowed!');
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

        // Append geo location if available
        if (values.latitude) {
          formData.append('latitude', values.latitude);
        }
        if (values.longitude) {
          formData.append('longitude', values.longitude);
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
      setAddressSuggestions([]);
      setAddressQuery('');
      onCancel();
    }
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



  return (
    <Modal
      title="Edit Field"
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Update"
      cancelText="Cancel"
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
      <Spin spinning={loading} tip="Updating field...">
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
                    label="Field name"
                    rules={[
                      { required: true, message: 'Please enter a field name!' },
                      { min: 3, message: 'Field name must be at least 3 characters!' },
                    ]}
                  >
                    <Input placeholder="Enter field name..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fieldNumber"
                    label="Field number"
                    rules={[{ required: true, message: 'Please enter field number!' }]}
                  >
                    <Input placeholder="e.g. Field 1, Field 2..." />
                  </Form.Item>
                </Col>
              </Row>

              <div className="relative">
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ required: true, message: 'Please enter address!' }]}
                >
                  <Input
                    placeholder="Enter full address..."
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
              >
                <Input placeholder="e.g. District 1, HCMC..." />
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

          {/* Right column - images and description */}
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
                      <span className="text-gray-500 font-normal ml-2">
                        ({imagePreviews.length}/5)
                      </span>
                    </label>
                    {imagePreviews.length >= 5 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        5 images limit reached
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
                      className="sr-only"
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
                              ? 'Upload field images'
                              : 'Add more images'}
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

                            {/* Delete image button */}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100"
                              title="Delete image"
                            >
                              ×
                            </button>

                            {/* Image index */}
                            <div className="absolute top-1 left-1 w-4 h-4 bg-black/50 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>

                            {/* "Old" tag for existing images */}
                            {preview.isExisting && (
                              <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-full">
                                Old
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
      </Spin>
    </Modal>
  );
};

export default EditFieldModal;