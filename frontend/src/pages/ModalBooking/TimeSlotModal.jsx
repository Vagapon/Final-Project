import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Form, Input, Select, InputNumber, Space, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const TimeSlotModal = ({ visible, onCancel, field }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && field) {
      loadTimeSlots();
    }
  }, [visible, field]);

  const loadTimeSlots = async () => {
    if (!field) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/timeslots/field/${field._id}`);
      if (response.data.success) {
        setTimeSlots(response.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải khung giờ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefault = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/timeslots/create-default/${field._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        message.success('Tạo khung giờ mặc định thành công');
        loadTimeSlots();
      }
    } catch (error) {
      message.error('Lỗi khi tạo khung giờ mặc định');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingSlot 
        ? `http://localhost:5000/api/timeslots/${editingSlot._id}`
        : 'http://localhost:5000/api/timeslots';
      
      const method = editingSlot ? 'put' : 'post';
      
      const response = await axios[method](url, {
        ...values,
        fieldId: field._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        message.success(editingSlot ? 'Cập nhật thành công' : 'Tạo thành công');
        setModalVisible(false);
        form.resetFields();
        setEditingSlot(null);
        loadTimeSlots();
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
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/timeslots/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        message.success('Xóa thành công');
        loadTimeSlots();
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const columns = [
    {
      title: 'Giờ',
      key: 'time',
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined />
          {record.startTime} - {record.endTime}
        </Space>
      )
    },
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
    {
      title: 'Hệ số',
      dataIndex: 'multiplier',
      key: 'multiplier',
      render: (mult) => `${mult}x`
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
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
          <Popconfirm
            title="Bạn có chắc muốn xóa khung giờ này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <Modal
        title={`Quản lý khung giờ - ${field?.name}`}
        open={visible}
        onCancel={onCancel}
        width={900}
        footer={null}
      >
        <div className="mb-4">
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              Thêm khung giờ
            </Button>
            <Button onClick={handleCreateDefault}>
              Tạo mặc định
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={timeSlots}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Modal>

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
    </>
  );
};

export default TimeSlotModal;

