import { paymentService } from '../../api/paymentManagement';

/**
 * Component hiển thị trạng thái thanh toán
 */
export default function PaymentStatus({ status, method, amount }) {
  const statusInfo = paymentService.getPaymentStatusInfo(status);
  const methodName = paymentService.getPaymentMethodName(method);

  return (
    <div className="payment-status-card">
      <div className={`status-badge status-${statusInfo.color}`}>
        <span className="status-icon">{statusInfo.icon}</span>
        <span className="status-label">{statusInfo.label}</span>
      </div>

      {method && (
        <div className="payment-method">
          <span className="label">Phương thức:</span>
          <span className="value">{methodName}</span>
        </div>
      )}

      {amount && (
        <div className="payment-amount">
          <span className="label">Số tiền:</span>
          <span className="value">{paymentService.formatPrice(amount)}</span>
        </div>
      )}
    </div>
  );
}

