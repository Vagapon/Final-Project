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
      message.error('Error loading field list');
    }
  };

  const loadTimeSlots = async (fieldId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/timeslots/field/${fieldId}`);
      const data = await response.json();
      if (data.success) setTimeSlots(data.data);
    } catch (error) {
      message.error('Error loading time slots');
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
      message.error('Error creating default time slots');
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
        message.success(editingSlot ? 'Updated successfully' : 'Created successfully');
        setModalVisible(false);
        form.resetFields();
        setEditingSlot(null);
        loadTimeSlots(selectedField);
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
      const response = await fetch(`/api/timeslots/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        message.success('Deleted successfully');
        loadTimeSlots(selectedField);
      }
    } catch (error) {
      message.error('An error occurred');
    }
  };

  const fieldColumns = [
    { title: 'Field Name', dataIndex: 'name', key: 'name' },
    { title: 'Field Number', dataIndex: 'fieldNumber', key: 'fieldNumber' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    { 
      title: 'Purpose', 
      dataIndex: 'purpose', 
      key: 'purpose',
      render: (purpose) => (
        <Tag color={purpose === 'event' ? 'blue' : 'green'}>
          {purpose === 'event' ? 'Event' : 'Rental'}
        </Tag>
      )
    },
    { title: 'Price/Hour', dataIndex: 'pricePerHour', key: 'pricePerHour', render: (price) => price ? `${price.toLocaleString()} VND` : 'Free' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
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
          Manage Time Slots
        </Button>
      )
    }
  ];

  const timeSlotColumns = [
    { title: 'Time', key: 'time', render: (_, record) => `${record.startTime} - ${record.endTime}` },
    { 
      title: 'Shift Type', 
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
    { title: 'Multiplier', dataIndex: 'multiplier', key: 'multiplier', render: (mult) => `${mult}x` },
    { title: 'Description', dataIndex: 'description', key: 'description' },
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
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <Card title="Field & Time Slot Management">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Field List" key="stadiums">
            <Table 
              columns={fieldColumns} 
              dataSource={fields} 
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          <TabPane tab="Time Slot Management" key="timeslots">
            <div className="mb-4">
              <Select
                placeholder="Select field to manage time slots"
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
                    Add Time Slot
                  </Button>
                  <Button onClick={handleCreateDefault}>
                    Create Default
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
        title={editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingSlot(null);
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="startTime" label="Start Time" rules={[{ required: true }]}>
            <Input type="time" />
          </Form.Item>
          
          <Form.Item name="endTime" label="End Time" rules={[{ required: true }]}>
            <Input type="time" />
          </Form.Item>
          
          <Form.Item name="timeType" label="Shift Type" rules={[{ required: true }]}>
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
            <Input placeholder="e.g., Morning shift, Afternoon shift..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StadiumManagement;
