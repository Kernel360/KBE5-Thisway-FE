import React, { useState, useEffect, useId } from 'react';
import styled from 'styled-components';
import Dialog from '@mui/material/Dialog';
import Button from '../../components/Button';
import { useDaumPostcodePopup } from 'react-daum-postcode';

const AdminCompanyRegisterModal = ({ 
  isOpen, 
  onClose, 
  type = 'create', // 'create' | 'edit'
  initialData = null,
  onSubmit,
  error,
  setError
}) => {
  const formId = useId();
  const fieldId = (name) => `${formId}-company-form-${name}`;
  const [formData, setFormData] = useState({
    name: '',
    crn: '',
    contact: '',
    addrRoad: '',
    addrDetail: '',
    memo: '',
    gpsCycle: 60
  });

  const openPostcodePopup = useDaumPostcodePopup();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        crn: '',
        contact: '',
        addrRoad: '',
        addrDetail: '',
        memo: '',
        gpsCycle: 60
      });
    }
    setError("");
  }, [initialData, isOpen, setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gpsCycle' ? parseInt(value) || 60 : value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.crn || !formData.contact) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        crn: formData.crn,
        contact: formData.contact,
        addrRoad: formData.addrRoad,
        addrDetail: formData.addrDetail,
        memo: formData.memo || '',
        gpsCycle: formData.gpsCycle
      };

      await onSubmit(submitData, type);
    } catch (error) {
      setError("저장하지 못했습니다. 입력 내용을 확인하고 다시 시도해주세요.");
    }
  };

  const handleAddressSearch = () => {
    openPostcodePopup({
      onComplete: (data) => {
        setFormData(prev => ({
          ...prev,
          addrRoad: data.roadAddress,
          addrDetail: ''
        }));
      }
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby={fieldId('title')}
      PaperProps={{ sx: { m: 2, width: 'calc(100% - 32px)', maxHeight: 'calc(100dvh - 32px)' } }}>
      <ModalContent>
        <ModalHeader>
          <h2 id={fieldId('title')}>{type === 'create' ? '신규 업체 등록' : '업체 정보 수정'}</h2>
          <CloseButton type="button" aria-label="닫기" onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit} aria-describedby={error ? fieldId('error') : undefined}>
          {error && <ErrorMessage role="alert" id={fieldId('error')}>{error}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor={fieldId('name')}>업체명</Label>
            <Input
              type="text"
              id={fieldId('name')}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="업체명 입력"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor={fieldId('crn')}>사업자등록번호</Label>
            <Input
              type="text"
              id={fieldId('crn')}
              name="crn"
              value={formData.crn}
              onChange={handleChange}
              placeholder="사업자등록번호 입력 (-없이 숫자만)"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor={fieldId('contact')}>연락처</Label>
            <Input
              type="text"
              id={fieldId('contact')}
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="연락처 입력 (숫자만)"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor={fieldId('addrRoad')}>주소</Label>
            <AddressContainer>
              <AddressInput
                type="text"
                id={fieldId('addrRoad')}
                name="addrRoad"
                value={formData.addrRoad}
                readOnly
                placeholder="도로명 주소"
              />
              <Button type="button" onClick={handleAddressSearch}>
                주소 검색
              </Button>
            </AddressContainer>
            <Label htmlFor={fieldId('addrDetail')}>상세 주소</Label>
            <Input
              id={fieldId('addrDetail')}
              type="text"
              name="addrDetail"
              value={formData.addrDetail}
              onChange={handleChange}
              placeholder="상세 주소 입력"
            />
          </FormGroup>

          {type === 'create' && (
            <>
              <FormGroup>
                <Label htmlFor={fieldId('gpsCycle')}>GPS 갱신 주기 (초)</Label>
                <Input
                  type="number"
                  id={fieldId('gpsCycle')}
                  name="gpsCycle"
                  value={formData.gpsCycle}
                  onChange={handleChange}
                  min="1"
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

const AddressContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: stretch;
  button { flex-shrink: 0; white-space: nowrap; }
  @media (max-width: 420px) { flex-direction: column; }
`;

const AddressInput = styled(Input)`
  flex: 1;
  background-color: ${({ theme }) => theme.palette.action.hover};
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

export default AdminCompanyRegisterModal; 