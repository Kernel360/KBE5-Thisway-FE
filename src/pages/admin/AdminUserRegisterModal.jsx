import React, { useState, useEffect, useId } from 'react';
import styled from 'styled-components';
import Dialog from '@mui/material/Dialog';
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
  const formId = useId();
  const fieldId = (name) => `${formId}-user-form-${name}`;
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
    setCompanySearchOpen(false);
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
      await onSubmit(submitData, type);
    } catch (error) {
      setError("저장하지 못했습니다. 입력 내용을 확인하고 다시 시도해주세요.");
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
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby={fieldId('title')}
      PaperProps={{ sx: { m: 2, width: 'calc(100% - 32px)', maxHeight: 'calc(100dvh - 32px)' } }}>
      <ModalContent>
        <ModalHeader>
          <h2 id={fieldId('title')}>{type === 'create' ? '신규 사용자 등록' : '사용자 정보 수정'}</h2>
          <CloseButton type="button" aria-label="닫기" onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit} aria-describedby={error ? fieldId('error') : undefined}>
          {error && <ErrorMessage role="alert" id={fieldId('error')}>{error}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor={fieldId('name')}>이름</Label>
            <Input
              type="text"
              id={fieldId('name')}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름 입력"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor={fieldId('email')}>이메일</Label>
            <Input
              type="email"
              id={fieldId('email')}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일 입력"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor={fieldId('phone')}>연락처</Label>
            <Input
              type="text"
              id={fieldId('phone')}
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
                <Label htmlFor={fieldId('companyName')}>소속 업체</Label>
                <CompanySelectContainer>
                  <CompanyInput
                    id={fieldId('companyName')}
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
                <Label htmlFor={fieldId('role')}>권한</Label>
                <Select
                  id={fieldId('role')}
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="COMPANY_CHEF">업체 최고 관리자</option>
                  <option value="ADMIN">시스템 관리자</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor={fieldId('password')}>비밀번호 *</Label>
                <Input
                  type="password"
                  id={fieldId('password')}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호 입력"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor={fieldId('confirmPassword')}>비밀번호 확인 *</Label>
                <Input
                  type="password"
                  id={fieldId('confirmPassword')}
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
            <Label htmlFor={fieldId('memo')}>메모</Label>
            <TextArea
              id={fieldId('memo')}
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
    </Dialog>
  );
};

const ModalContent = styled.div`
  background-color: white;
  padding: 24px;
  min-width: 0;
  @media (max-width: 420px) { padding: 20px 16px; }
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
  min-width: 44px;
  min-height: 44px;
  flex-shrink: 0;
  border-radius: 10px;
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
  padding: 11px 12px;
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 10px;
  font-size: 14px;

  &:focus {
    outline: 2px solid #087F8C;
    outline-offset: 2px;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 11px 12px;
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 10px;
  font-size: 14px;
  background-color: white;

  &:focus {
    outline: 2px solid #087F8C;
    outline-offset: 2px;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 11px 12px;
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 10px;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: 2px solid #087F8C;
    outline-offset: 2px;
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
  border-radius: 10px;
  text-align: center;
`;

const CompanySelectContainer = styled.div`
  display: flex;
  gap: 8px;
  @media (max-width: 420px) { flex-direction: column; }
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