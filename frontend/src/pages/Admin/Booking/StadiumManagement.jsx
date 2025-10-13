import React, { useState, useEffect } from 'react';
import { Tabs, Card, Button, Table, Modal, Form, Input, Select, InputNumber, Space, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

const StadiumManagement = () => {
  const [activeTab, setActiveTab] = useState('stadiums');
  const [fields, setFields] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadFields();
  }, []);

  useEffect(() => {
    if (selectedField) {
      loadTimeSlots(selectedField);
    }
  }, [selectedField]);

  const loadFields = async () => {
    try {
      const response = await fetch('/api/fields');
      const data = await response.json();
      if (data.success) setFields(data.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách sân');
    }
  };

  const loadTimeSlots = async (fieldId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/timeslots/field/${fieldId}`);
      const data = await response.json();
      if (data.success) setTimeSlots(data.data);
    } catch (error) {
      message.error('Lỗi khi tải khung giờ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefault = async () => {
    try {
      const response = await fetch(`/api/timeslots/create-default/${selectedField}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        message.success(data.message);
        loadTimeSlots(selectedField);
      }
    } catch (error) {
      message.error('Lỗi khi tạo khung giờ mặc định');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingSlot ? `/api/timeslots/${editingSlot._id}` : '/api/timeslots';
      const method = editingSlot ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...values, fieldId: selectedField })
      });

      const data = await response.json();
      if (data.success) {
        message.success(editingSlot ? 'Cập nhật thành công' : 'Tạo thành công');
        setModalVisible(false);
        form.resetFields();
        setEditingSlot(null);
        loadTimeSlots(selectedField);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    form.setFieldsValue(slot);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/timeslots/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        message.success('Xóa thành công');
        loadTimeSlots(selectedField);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const fieldColumns = [
    { title: 'Tên sân', dataIndex: 'name', key: 'name' },
    { title: 'Số sân', dataIndex: 'fieldNumber', key: 'fieldNumber' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    { 
      title: 'Mục đích', 
      dataIndex: 'purpose', 
      key: 'purpose',
      render: (purpose) => (
        <Tag color={purpose === 'event' ? 'blue' : 'green'}>
          {purpose === 'event' ? 'Event' : 'Rental'}
        </Tag>
      )
    },
    { title: 'Giá/giờ', dataIndex: 'pricePerHour', key: 'pricePerHour', render: (price) => price ? `${price.toLocaleString()}đ` : 'Miễn phí' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => {
            setSelectedField(record._id);
            setActiveTab('timeslots');
          }}
        >
          Quản lý khung giờ
        </Button>
      )
    }
  ];

  const timeSlotColumns = [
    { title: 'Giờ', key: 'time', render: (_, record) => `${record.startTime} - ${record.endTime}` },
    { 
      title: 'Loại ca', 
      dataIndex: 'timeType', 
      key: 'timeType',
      render: (type) => {
        const typeMap = {
          'ca_sang': { text: 'Ca sáng', color: 'blue' },
          'ca_chieu': { text: 'Ca chiều', color: 'orange' },
          'ca_toi': { text: 'Ca tối', color: 'purple' }
        };
        const config = typeMap[type] || { text: 'Không xác định', color: 'gray' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    { title: 'Hệ số', dataIndex: 'multiplier', key: 'multiplier', render: (mult) => `${mult}x` },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'available' ? 'green' : status === 'booked' ? 'red' : 'orange'}>
          {status === 'available' ? 'Trống' : status === 'booked' ? 'Đã đặt' : 'Bảo trì'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <Card title="Quản lý sân bóng & khung giờ">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Danh sách sân" key="stadiums">
            <Table 
              columns={fieldColumns} 
              dataSource={fields} 
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane tab="Quản lý khung giờ" key="timeslots">
            <div className="mb-4">
              <Select
                placeholder="Chọn sân để quản lý khung giờ"
                style={{ width: 300, marginRight: 16 }}
                value={selectedField}
                onChange={setSelectedField}
              >
                {fields.map(field => (
                  <Option key={field._id} value={field._id}>
                    {field.name} - {field.fieldNumber}
                  </Option>
                ))}
              </Select>
              
              {selectedField && (
                <Space>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                    Thêm khung giờ
                  </Button>
                  <Button onClick={handleCreateDefault}>
                    Tạo mặc định
                  </Button>
                </Space>
              )}
            </div>

            {selectedField && (
              <Table
                columns={timeSlotColumns}
                dataSource={timeSlots}
                loading={loading}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
              />
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingSlot ? 'Chỉnh sửa khung giờ' : 'Thêm khung giờ mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingSlot(null);
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="startTime" label="Giờ bắt đầu" rules={[{ required: true }]}>
            <Input type="time" />
          </Form.Item>
          
          <Form.Item name="endTime" label="Giờ kết thúc" rules={[{ required: true }]}>
            <Input type="time" />
          </Form.Item>
          
          <Form.Item name="timeType" label="Loại ca" rules={[{ required: true }]}>
            <Select>
              <Option value="ca_sang">Ca sáng</Option>
              <Option value="ca_chieu">Ca chiều</Option>
              <Option value="ca_toi">Ca tối</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="multiplier" label="Hệ số nhân" rules={[{ required: true }]}>
            <InputNumber min={0.1} max={3.0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="description" label="Mô tả">
            <Input placeholder="VD: Ca sáng, Ca chiều..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StadiumManagement;
