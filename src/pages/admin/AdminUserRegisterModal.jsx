import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../../components/Button';
import CompanySearchModal from './CompanySearchModal';

const AdminUserRegisterModal = ({ 
  isOpen, 
  onClose,
  type = 'create',
  initialData = null,
  onSubmit,
  error,
  setError
}) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'COMPANY_CHEF',
    password: '',
    confirmPassword: '',
    companyId: '',
    companyName: '',
    memo: ''
  });
  const [companySearchOpen, setCompanySearchOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        id: initialData.id || '',
        password: '',
        confirmPassword: '',
        companyName: initialData.companyName || '',
        companyId: initialData.companyId?.toString() || '',
        memo: initialData.memo || ''
      });
    } else {
      setFormData({
        id: '',
        name: '',
        email: '',
        phone: '',
        role: 'COMPANY_CHEF',
        password: '',
        confirmPassword: '',
        companyId: '',
        companyName: '',
        memo: ''
      });
    }
    setError("");
  }, [initialData, isOpen, setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }

    if (type === 'create' && !formData.companyId) {
      setError("업체를 선택해주세요.");
      return;
    }

    if (type === 'create' && !formData.password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (type === 'create' && !formData.role) {
      setError("권한을 선택해주세요.");
      return;
    }

    try {
      const submitData = {
        companyId: parseInt(formData.companyId, 10),
        role: formData.role,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        memo: formData.memo || ''
      };
      console.log(submitData);
      await onSubmit(submitData, type);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCompanySelect = (company) => {
    setFormData(prev => ({
      ...prev,
      companyId: company.id,
      companyName: company.name,
    }));
    setCompanySearchOpen(false);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{type === 'create' ? '신규 사용자 등록' : '사용자 정보 수정'}</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label>이름</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름 입력"
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
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="연락처 입력 (숫자만)"
              required
            />
          </FormGroup>

          {type === 'create' && (
            <>
              <FormGroup>
                <Label>소속 업체</Label>
                <CompanySelectContainer>
                  <CompanyInput
                    type="text"
                    value={formData.companyName}
                    placeholder="업체를 선택하세요"
                    readOnly
                  />
                  <CompanySelectButton
                    type="button"
                    onClick={() => setCompanySearchOpen(true)}
                  >
                    업체 선택
                  </CompanySelectButton>
                </CompanySelectContainer>
              </FormGroup>

              <FormGroup>
                <Label>권한</Label>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="COMPANY_CHEF">업체 최고 관리자</option>
                  <option value="ADMIN">시스템 관리자</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>비밀번호 *</Label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호 입력"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>비밀번호 확인 *</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호 확인"
                  required
                />
              </FormGroup>
            </>
          )}

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

          <ButtonGroup>
            <Button type="button" onClick={onClose} variant="outlined">
              취소
            </Button>
            <Button type="submit">
              {type === 'create' ? '등록' : '수정'}
            </Button>
          </ButtonGroup>
        </form>

        <CompanySearchModal
          isOpen={companySearchOpen}
          onClose={() => setCompanySearchOpen(false)}
          onSelect={handleCompanySelect}
        />
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

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.palette.error.main};
  color: ${({ theme }) => theme.palette.error.contrastText};
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 4px;
  text-align: center;
`;

const CompanySelectContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const CompanyInput = styled(Input)`
  flex: 1;
  background-color: ${({ theme }) => theme.palette.action.hover};
  cursor: default;
`;

const CompanySelectButton = styled(Button)`
  white-space: nowrap;
`;

export default AdminUserRegisterModal; 