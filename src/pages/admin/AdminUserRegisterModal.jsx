import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../../components/Button';

const AdminUserRegisterModal = ({ 
  isOpen, 
  onClose, 
  mode = 'user', // 'user' | 'company'
  type = 'create', // 'create' | 'edit'
  initialData = null,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    memo: '',
    role: 'MEMBER',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // 초기화
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        memo: '',
        role: 'MEMBER',
        status: 'ACTIVE'
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData, type);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      // TODO: 에러 처리
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h2>{type === 'create' ? '신규 ' : ''}
            {mode === 'user' ? '사용자' : '업체'} 
            {type === 'create' ? ' 등록' : ' 수정'}
          </h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>{mode === 'user' ? '이름' : '업체명'}</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={mode === 'user' ? '이름 입력' : '업체명 입력'}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>이메일</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일 입력"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>연락처</Label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="연락처 입력"
              required
            />
          </FormGroup>

          {mode === 'user' && (
            <>
              <FormGroup>
                <Label>소속 업체</Label>
                <Input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="소속 업체 입력"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>권한</Label>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="MEMBER">일반 사용자</option>
                  <option value="ADMIN">관리자</option>
                </Select>
              </FormGroup>
            </>
          )}

          {mode === 'company' && (
            <FormGroup>
              <Label>메모</Label>
              <TextArea
                name="memo"
                value={formData.memo}
                onChange={handleChange}
                placeholder="메모 입력"
                rows={3}
              />
            </FormGroup>
          )}

          <FormGroup>
            <Label>상태</Label>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
            </Select>
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={onClose} variant="outlined">
              취소
            </Button>
            <Button type="submit">
              {type === 'create' ? '등록' : '수정'}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  color: ${({ theme }) => theme.palette.text.secondary};

  &:hover {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 4px;
  font-size: 14px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
`;

export default AdminUserRegisterModal; 