import React, { ReactNode } from 'react';
import { useAlertStore } from '../store/alertStore';
import Alert from '../components/Alert';

interface GlobalAlertProps {
  children: ReactNode;
}

const GlobalAlert: React.FC<GlobalAlertProps> = ({ children }) => {
  const { visible, title, message, onConfirm, onCancel, hideAlert } = useAlertStore();

  const handleClose = () => {
    hideAlert();
    onCancel?.(); // gọi hàm huỷ nếu có
  };

  const handleConfirm = () => {
    hideAlert();
    onConfirm?.(); // gọi hàm xác nhận nếu có
  };

  return (
    <>
      <Alert
        visible={visible}
        title={title}
        message={message}
        onClose={handleClose}
        onConfirm={onConfirm ? handleConfirm : undefined}
      />
      {children}
    </>
  );
};

export default GlobalAlert;
