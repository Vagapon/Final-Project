import React from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Divider,
  Row,
  Col,
  Card,
  Typography,
  Space,
  Image,
} from 'antd';
import {
  EyeOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  ToolOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const FieldDetailModal = ({ visible, onCancel, field }) => {
  if (!field) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'maintenance':
        return 'orange';
      case 'inactive':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'maintenance':
        return 'Bảo trì';
      case 'inactive':
        return 'Ngừng hoạt động';
      default:
        return status;
    }
  };

  const getPurposeText = (purpose) => {
    switch (purpose) {
      case 'event':
        return 'Sân giải đấu';
      case 'rental':
        return 'Sân thuê';
      default:
        return purpose;
    }
  };

  const getPurposeColor = (purpose) => {
    switch (purpose) {
      case 'event':
        return 'blue';
      case 'rental':
        return 'green';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EyeOutlined />
          <span>Chi tiết sân bóng</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnClose
    >
      <div style={{ padding: '0 8px' }}>
        <Row gutter={24}>
          <Col span={24}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                marginBottom: '24px',
              }}
              bordered={false}
            >
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                {field.name}
              </Title>
              <Space size="large" style={{ marginTop: '8px' }}>
                <span>
                  <ToolOutlined /> {getPurposeText(field.purpose)}
                </span>
                <span>
                  <EnvironmentOutlined /> {field.location}
                </span>
                <Tag color={getStatusColor(field.status)} size="large">
                  {getStatusText(field.status)}
                </Tag>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Card title="Thông tin cơ bản" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item 
                  label={<><ToolOutlined /> Số sân</>}
                >
                  {field.fieldNumber}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<><DollarOutlined /> Giá thuê</>}
                >
                  {field.pricePerHour ? `${field.pricePerHour.toLocaleString('vi-VN')} VNĐ/giờ` : 'Miễn phí'}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<><EnvironmentOutlined /> Địa chỉ</>}
                >
                  {field.address}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<><ClockCircleOutlined /> Giờ hoạt động</>}
                >
                  {field.openingHours?.start} - {field.openingHours?.end}
                </Descriptions.Item>
                <Descriptions.Item label="Mục đích sử dụng">
                  <Tag color={getPurposeColor(field.purpose)}>{getPurposeText(field.purpose)}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Thông tin quản lý" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item 
                  label={<><CalendarOutlined /> Ngày tạo</>}
                >
                  {formatDate(field.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item 
                  label={<><CalendarOutlined /> Cập nhật lần cuối</>}
                >
                  {formatDate(field.updatedAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(field.status)}>
                    {getStatusText(field.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="ID">
                  #{field._id}
                </Descriptions.Item>
                <Descriptions.Item label="Quản lý bởi">
                  {field.managedBy?.name || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {field.images && field.images.length > 0 && (
          <>
            <Divider orientation="left">Hình ảnh sân</Divider>
            <div style={{ marginBottom: '24px' }}>
              <Image.PreviewGroup>
                <Row gutter={[16, 16]}>
                  {field.images.map((imageUrl, index) => (
                    <Col span={8} key={index}>
                      <Image
                        src={imageUrl}
                        alt={`Hình ảnh sân ${index + 1}`}
                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </div>
          </>
        )}

        {field.description && (
          <>
            <Divider orientation="left">Mô tả chi tiết</Divider>
            <Card size="small">
              <Paragraph
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: 0,
                  color: '#666',
                }}
              >
                {field.description}
              </Paragraph>
            </Card>
          </>
        )}
      </div>
    </Modal>
  );
};

export default FieldDetailModal;