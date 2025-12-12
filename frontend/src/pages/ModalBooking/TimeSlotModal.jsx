import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Table, Button, Form, Input, Select, InputNumber, Space, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const SHIFT_RANGES = {
  ca_sang: { label: 'Morning', start: '05:00', end: '12:00' },
  ca_chieu: { label: 'Afternoon', start: '12:00', end: '18:00' },
  ca_toi: { label: 'Evening', start: '18:00', end: '23:59' },
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const TimeSlotModal = ({ visible, onCancel, field }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingDefault, setCreatingDefault] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form] = Form.useForm();
  const openStart = field?.openingHours?.start;
  const openEnd = field?.openingHours?.end;
  const openStartMin = useMemo(() => parseTimeToMinutes(openStart), [openStart]);
  const openEndMin = useMemo(() => parseTimeToMinutes(openEnd), [openEnd]);

  useEffect(() => {
    if (visible && field) {
      loadTimeSlots();
    }
  }, [visible, field]);

  const dedupeSlots = (slots = []) => {
    const seen = new Set();
    return slots.filter((s) => {
      const key = `${s.startTime}-${s.endTime}-${s.timeType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const loadTimeSlots = async () => {
    if (!field) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/timeslots/field/${field._id}`);
      if (response.data.success) {
        setTimeSlots(dedupeSlots(response.data.data));
      }
    } catch (error) {
      message.error('Failed to load time slots');
    } finally {
      setLoading(false);
    }
  };

  const doCreateDefault = async () => {
    try {
      setCreatingDefault(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/timeslots/create-default/${field._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        message.success('Default time slots created successfully');
        loadTimeSlots();
      }
    } catch (error) {
      message.error('Failed to create default time slots');
    } finally {
      setCreatingDefault(false);
    }
  };

  const handleCreateDefault = () => {
    if (timeSlots.length > 0) {
      Modal.confirm({
        title: 'Overwrite existing time slots?',
        content: 'Default slots already exist. Create again may duplicate them. Continue?',
        okText: 'Create',
        cancelText: 'Cancel',
        onOk: () => doCreateDefault(),
      });
    } else {
      doCreateDefault();
    }
  };

  const normalizedSlots = useMemo(() => {
    return (timeSlots || []).map((s) => ({
      ...s,
      startMin: parseTimeToMinutes(s.startTime),
      endMin: parseTimeToMinutes(s.endTime),
    }));
  }, [timeSlots]);

  const handleSubmit = async (values) => {
    try {
      const startMin = parseTimeToMinutes(values.startTime);
      const endMin = parseTimeToMinutes(values.endTime);
      const duration = endMin !== null && startMin !== null ? endMin - startMin : null;

      if (duration === null) {
        message.error('Invalid time range');
        return;
      }

      // Duration must be 90 minutes
      if (duration !== 90) {
        message.error('Each time slot must be exactly 90 minutes');
        return;
      }

      // Must be at least 30 minutes away from other slots (no overlap or tight adjacency)
      const others = normalizedSlots.filter((s) => !editingSlot || s._id !== editingSlot._id);
      const tooClose = others.some((s) => {
        if (s.startMin === null || s.endMin === null) return false;
        // Require end <= other.start - 30 OR start >= other.end + 30
        const separated = endMin <= s.startMin - 30 || startMin >= s.endMin + 30;
        return !separated;
      });
      if (tooClose) {
        message.error('Time slot must be at least 30 minutes apart from others');
        return;
      }

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
        message.success(editingSlot ? 'Updated successfully' : 'Created successfully');
        setModalVisible(false);
        form.resetFields();
        setEditingSlot(null);
        loadTimeSlots();
      }
    } catch (error) {
      message.error('An error occurred');
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
        message.success('Deleted successfully');
        loadTimeSlots();
      }
    } catch (error) {
      message.error('An error occurred');
    }
  };

  const columns = [
    {
      title: 'Time',
      key: 'time',
      render: (_, record) => (
        <Space>
          <ClockCircleOutlined />
          {record.startTime} - {record.endTime}
        </Space>
      )
    },
    {
      title: 'Shift type',
      dataIndex: 'timeType',
      key: 'timeType',
      render: (type) => {
        const typeMap = {
          'ca_sang': { text: 'Morning', color: 'blue' },
          'ca_chieu': { text: 'Afternoon', color: 'orange' },
          'ca_toi': { text: 'Evening', color: 'purple' }
        };
        const config = typeMap[type] || { text: 'Unknown', color: 'gray' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Multiplier',
      dataIndex: 'multiplier',
      key: 'multiplier',
      render: (mult) => `${mult}x`
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'available' ? 'green' : status === 'booked' ? 'red' : 'orange'}>
          {status === 'available' ? 'Available' : status === 'booked' ? 'Booked' : 'Maintenance'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Are you sure you want to delete this time slot?"
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
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
        title={`Time slot management - ${field?.name}`}
        open={visible}
        onCancel={onCancel}
        width={900}
        footer={null}
      >
        <div className="mb-4">
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              Add time slot
            </Button>
            <Button onClick={handleCreateDefault} loading={creatingDefault} disabled={creatingDefault || loading}>
              Create default
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
        title={editingSlot ? 'Edit time slot' : 'Add new time slot'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingSlot(null);
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="startTime"
            label="Start time"
            rules={[
              { required: true, message: 'Please enter start time' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const start = parseTimeToMinutes(value);
                  const end = parseTimeToMinutes(getFieldValue('endTime'));
                  if (start === null) return Promise.reject(new Error('Invalid start time'));
                  if (openStartMin !== null && start < openStartMin) {
                    return Promise.reject(new Error('Start time must be after field opening time'));
                  }
                  if (openEndMin !== null && start > openEndMin) {
                    return Promise.reject(new Error('Start time must be before field closing time'));
                  }
                  if (end !== null && start >= end) {
                    return Promise.reject(new Error('Start time must be before end time'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input type="time" />
          </Form.Item>
          
          <Form.Item
            name="endTime"
            label="End time"
            rules={[
              { required: true, message: 'Please enter end time' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const end = parseTimeToMinutes(value);
                  const start = parseTimeToMinutes(getFieldValue('startTime'));
                  if (end === null) return Promise.reject(new Error('Invalid end time'));
                  if (start !== null && end <= start) {
                    return Promise.reject(new Error('End time must be after start time'));
                  }
                  if (openEndMin !== null && end > openEndMin) {
                    return Promise.reject(new Error('End time must be before field closing time'));
                  }
                  if (openStartMin !== null && end < openStartMin) {
                    return Promise.reject(new Error('End time must be after field opening time'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input type="time" />
          </Form.Item>
          
          <Form.Item
            name="timeType"
            label="Shift type"
            rules={[
              { required: true, message: 'Please select shift type' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !SHIFT_RANGES[value]) return Promise.resolve();
                  const start = parseTimeToMinutes(getFieldValue('startTime'));
                  const end = parseTimeToMinutes(getFieldValue('endTime'));
                  const rangeStart = parseTimeToMinutes(SHIFT_RANGES[value].start);
                  const rangeEnd = parseTimeToMinutes(SHIFT_RANGES[value].end);
                  if (start !== null && start < rangeStart) {
                    return Promise.reject(new Error(`Start time must be in ${SHIFT_RANGES[value].label} range`));
                  }
                  if (end !== null && end > rangeEnd) {
                    return Promise.reject(new Error(`End time must be in ${SHIFT_RANGES[value].label} range`));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Select>
              <Option value="ca_sang">Morning</Option>
              <Option value="ca_chieu">Afternoon</Option>
              <Option value="ca_toi">Evening</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="multiplier" label="Multiplier" rules={[{ required: true }]}>
            <InputNumber min={0.1} max={3.0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="description" label="Description">
            <Input placeholder="e.g. Morning shift, Afternoon shift..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TimeSlotModal;

