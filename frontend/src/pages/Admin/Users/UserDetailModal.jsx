import React, { useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../../../utils/apiConfig';
import { 
  Modal, 
  Card, 
  Avatar, 
  Tag, 
  Descriptions, 
  Button, 
  Space, 
  Divider, 
  Row, 
  Col, 
  Statistic,
  Typography,
  Tooltip,
  message,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  CalendarOutlined, 
  SafetyCertificateOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  TrophyOutlined,
  TeamOutlined,
  StarOutlined,
  FireOutlined,
  IdcardOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  PlusCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const UserDetailModal = ({ isOpen, onClose, user, onEdit, onDelete, onToggleStatus }) => {
  const [showActions, setShowActions] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [teamLoading, setTeamLoading] = useState(false);

  // Fetch team data when modal opens
  React.useEffect(() => {
    if (isOpen && user?._id) {
      fetchTeamData();
    }
  }, [isOpen, user?._id]);

  const fetchTeamData = async () => {
    try {
      setTeamLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      const response = await axios.get(`${apiUrl}/team/manager/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeamData(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setTeamData(null); // User has no team
      } else {
        console.error('Error fetching team data:', error);
        setTeamData(null);
      }
    } finally {
      setTeamLoading(false);
    }
  };

  if (!user) return null;

  // Get role color and icon
  const getRoleConfig = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return {
          color: 'red',
          icon: <SafetyCertificateOutlined />,
          text: 'Administrator'
        };
      case 'staff':
        return {
          color: 'blue',
          icon: <TeamOutlined />,
          text: 'Staff'
        };
      case 'user':
        return {
          color: 'green',
          icon: <UserOutlined />,
          text: 'User'
        };
      default:
        return {
          color: 'default',
          icon: <UserOutlined />,
          text: 'Unknown'
        };
    }
  };

  const getStatusConfig = (isActive) => {
    return isActive ? {
      color: 'success',
      icon: <CheckCircleOutlined />,
      text: 'Active'
    } : {
      color: 'error',
      icon: <CloseCircleOutlined />,
      text: 'Inactive'
    };
  };

  const roleConfig = getRoleConfig(user.role);
  const statusConfig = getStatusConfig(user.isActive);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    onEdit(user);
    onClose();
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Confirm User Deletion',
      content: `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        onDelete(user._id);
        onClose();
      },
    });
  };

  const handleToggleStatus = () => {
    const newStatus = !user.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    
    Modal.confirm({
      title: `Confirm ${action} user`,
      content: `Are you sure you want to ${action} user "${user.name}"?`,
      okText: newStatus ? 'Activate' : 'Deactivate',
      okType: newStatus ? 'primary' : 'default',
      cancelText: 'Cancel',
      onOk() {
        onToggleStatus(user._id, newStatus);
        message.success(`Successfully ${action}d user`);
      },
    });
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined style={{ fontSize: 20 }} />
          <span>User Details</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      width={1000}
      footer={null}
      destroyOnClose
    >
      <div>
        {/* User Profile Card */}
        <Card 
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: 24 }}
        >
          <Row gutter={24} align="middle">
            <Col>
              <Avatar 
                size={80} 
                src={user.avatar}
                style={{ backgroundColor: '#1890ff' }}
              >
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </Col>
            <Col flex="auto">
              <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                {user.name || 'No name provided'}
              </Title>
              <Text type="secondary" style={{ fontSize: 16, marginBottom: 16, display: 'block' }}>
                {user.email}
              </Text>
              <Space size="middle">
                <Tag 
                  color={roleConfig.color} 
                  icon={roleConfig.icon}
                  style={{ fontSize: 12, padding: '4px 8px' }}
                >
                  {roleConfig.text}
                </Tag>
              </Space>
            </Col>
            {/* Team Avatar on the right side */}
            {teamData && (
              <Col>
                <Tooltip title={`Team: ${teamData.name}`}>
                  <Avatar 
                    size={60} 
                    src={teamData.avatar}
                    style={{ backgroundColor: '#52c41a' }}
                  >
                    {teamData.name?.charAt(0)?.toUpperCase() || 'T'}
                  </Avatar>
                </Tooltip>
              </Col>
            )}
          </Row>
        </Card>

        {/* Two Column Layout */}
        <Row gutter={16}>
          {/* Left Column - Personal Information */}
          <Col span={12}>
            <Card title="Personal Information" style={{ height: '100%' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item 
                  label={
                    <span>
                      <MailOutlined style={{ marginRight: 4 }} />
                      Email
                    </span>
                  }
                >
                  {user.email || 'Not updated'}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={
                    <span>
                      <PhoneOutlined style={{ marginRight: 4 }} />
                      Phone Number
                    </span>
                  }
                >
                  {user.phone_number || 'Not updated'}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={
                    <span>
                      <EnvironmentOutlined style={{ marginRight: 4 }} />
                      Address
                    </span>
                  }
                >
                  {user.address || 'Not updated'}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={
                    <span>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      Created Date
                    </span>
                  }
                >
                  {formatDate(user.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={
                    <span>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      Last Updated
                    </span>
                  }
                >
                  {formatDate(user.updatedAt)}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={
                    <span>
                      <IdcardOutlined style={{ marginRight: 4 }} />
                      User ID
                    </span>
                  }
                >
                  <Text code>{user._id || 'N/A'}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Right Column - Team Information */}
          <Col span={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TeamOutlined />
                  <span>Team Information</span>
                </div>
              } 
              style={{ height: '100%' }}
            >
              {teamLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">Loading team information...</Text>
                  </div>
                </div>
              ) : teamData ? (
                <div>
                  {/* Team Info - Two Column Layout */}
                  <Row gutter={[16, 16]}>
                    {/* Left Column */}
                    <Col span={12}>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                            <TeamOutlined style={{ marginRight: 4 }} />
                            Team Name
                          </Text>
                          <Text strong style={{ fontSize: 14 }}>
                            {teamData.name}
                          </Text>
                        </div>
                        
                        {teamData.shortName && (
                          <div>
                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                              <StarOutlined style={{ marginRight: 4 }} />
                              Short Name
                            </Text>
                            <Text strong style={{ fontSize: 14 }}>
                              {teamData.shortName}
                            </Text>
                          </div>
                        )}
                        
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                            <FileTextOutlined style={{ marginRight: 4 }} />
                            Description
                          </Text>
                          <Text style={{ fontSize: 14 }}>
                            {teamData.description || 'No description available'}
                          </Text>
                        </div>
                      </Space>
                    </Col>
                    
                    {/* Right Column */}
                    <Col span={12}>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            Created Date
                          </Text>
                          <Text style={{ fontSize: 14 }}>
                            {formatDate(teamData.createdAt)}
                          </Text>
                        </div>
                        
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            Last Updated
                          </Text>
                          <Text style={{ fontSize: 14 }}>
                            {formatDate(teamData.updatedAt)}
                          </Text>
                        </div>
                        
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                            <IdcardOutlined style={{ marginRight: 4 }} />
                            Team ID
                          </Text>
                          <Text code style={{ fontSize: 12 }}>
                            {teamData._id}
                          </Text>
                        </div>
                      </Space>
                    </Col>
                  </Row>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <PlusCircleOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                  <Title level={4} type="secondary">
                    No Team
                  </Title>
                  <Text type="secondary">
                    This user has not joined or created any team
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Administrative Actions</span>
              <Button
                type="text"
                icon={showActions ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setShowActions(!showActions)}
                size="small"
              >
                {showActions ? 'Hide' : 'Show'} actions
              </Button>
            </div>
          }
        >
          {showActions && (
            <Space wrap>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Edit
              </Button>
              
              <Button
                type={user.isActive ? 'default' : 'primary'}
                icon={user.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                onClick={handleToggleStatus}
                danger={user.isActive}
              >
                {user.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                Delete Account
              </Button>
            </Space>
          )}
        </Card>
      </div>
    </Modal>
  );
};

export default UserDetailModal;