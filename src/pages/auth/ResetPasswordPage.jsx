import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../services/authApi';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = async () => {
    try {
      // TODO: API 호출
      const response = await authApi.post('/auth/reset-password', {
        email,
        verificationCode,
        newPassword,
        confirmPassword
      });
      
      if (response.status === 200) {
        navigate('/auth/reset-password-success');
      } else {
        navigate('/auth/reset-password-error');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      navigate('/auth/reset-password-error');
    }
  };

  return (
    <div>
      {/* Render your form components here */}
    </div>
  );
};

export default ResetPasswordPage; 