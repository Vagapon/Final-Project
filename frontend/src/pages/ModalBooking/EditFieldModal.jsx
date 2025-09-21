import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Tag,
  Upload,
  Button,
  message,
} from 'antd';
import { EditOutlined, UploadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const EditFieldModal = ({ visible, onCancel, onUpdate, initialValues }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (visible && initialValues) {
      // Set form values
      form.setFieldsValue({
        name: initialValues.name,
        fieldNumber: initialValues.fieldNumber,
        address: initialValues.address,
        location: initialValues.location,
        purpose: initialValues.purpose,
        pricePerHour: initialValues.pricePerHour,
        openingHours: {
          start: initialValues.openingHours?.start,
          end: initialValues.openingHours?.end,
        },
        status: initialValues.status,
        description: initialValues.description,
      });

      // Set existing images as file list
      if (initialValues.images && initialValues.images.length > 0) {
        const existingFiles = initialValues.images.map((imageUrl, index) => ({
          uid: `existing-${index}`,
          name: `image-${index}.jpg`,
          status: 'done',
          url: imageUrl,
          isExisting: true,
        }));
        setFileList(existingFiles);
      } else {
        setFileList([]);
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = () => {
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
        formData.append('purpose', values.purpose);
        formData.append('openingHours[start]', values.openingHours?.start);
        formData.append('openingHours[end]', values.openingHours?.end);
        formData.append('status', values.status);
        formData.append('description', values.description || '');
        
        // Thêm giá thuê nếu là sân rental
        if (values.purpose === 'rental' && values.pricePerHour) {
          formData.append('pricePerHour', values.pricePerHour);
        }
        
        // Thêm file ảnh mới (không phải existing)
        const newFiles = fileList.filter(file => !file.isExisting);
        newFiles.forEach((file) => {
          formData.append('images', file.originFileObj);
        });
        
        onUpdate(formData);
        form.resetFields();
        setFileList([]);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  const uploadProps = {
    name: 'images',
    multiple: true,
    fileList: fileList,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ được upload file ảnh!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Ảnh phải nhỏ hơn 5MB!');
        return false;
      }
      return false; // Prevent auto upload
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
  };


  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EditOutlined />
          <span>Chỉnh sửa sân bóng</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Cập nhật"
      cancelText="Hủy"
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
      >
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

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
            >
              <Input placeholder="Nhập địa chỉ chi tiết..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="location"
              label="Khu vực"
            >
              <Input placeholder="VD: Quận 1, TP.HCM..." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="purpose"
              label="Mục đích sử dụng"
              rules={[{ required: true, message: 'Vui lòng chọn mục đích sử dụng!' }]}
            >
              <Select placeholder="Chọn mục đích sử dụng">
                <Option value="event">
                  <Tag color="blue">Sân giải đấu</Tag>
                </Option>
                <Option value="rental">
                  <Tag color="green">Sân thuê</Tag>
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="pricePerHour"
              label="Giá thuê (VNĐ/giờ)"
              dependencies={['purpose']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const purpose = getFieldValue('purpose');
                    if (purpose === 'rental' && (!value || value <= 0)) {
                      return Promise.reject(new Error('Sân thuê phải có giá thuê hợp lệ!'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Nhập giá thuê..."
                min={0}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={['openingHours', 'start']}
              label="Giờ mở cửa"
              rules={[{ required: true, message: 'Vui lòng nhập giờ mở cửa!' }]}
            >
              <Input type="time" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['openingHours', 'end']}
              label="Giờ đóng cửa"
              rules={[{ required: true, message: 'Vui lòng nhập giờ đóng cửa!' }]}
            >
              <Input type="time" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="active">
                  <Tag color="green">Hoạt động</Tag>
                </Option>
                <Option value="maintenance">
                  <Tag color="orange">Bảo trì</Tag>
                </Option>
                <Option value="inactive">
                  <Tag color="red">Ngừng hoạt động</Tag>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="images"
          label="Hình ảnh sân"
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Chọn ảnh mới (tối đa 5 ảnh)</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea
            rows={4}
            placeholder="Nhập mô tả chi tiết về sân bóng..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditFieldModal;