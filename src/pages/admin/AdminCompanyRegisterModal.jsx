import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
      console.error('Form submission error:', error);
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
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{type === 'create' ? '신규 업체 등록' : '업체 정보 수정'}</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label>업체명</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="업체명 입력"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>사업자등록번호</Label>
            <Input
              type="text"
              name="crn"
              value={formData.crn}
              onChange={handleChange}
              placeholder="사업자등록번호 입력 (-없이 숫자만)"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>연락처</Label>
            <Input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="연락처 입력 (숫자만)"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>주소</Label>
            <AddressContainer>
              <AddressInput
                type="text"
                name="addrRoad"
                value={formData.addrRoad}
                readOnly
                placeholder="도로명 주소"
              />
              <Button type="button" onClick={handleAddressSearch}>
                주소 검색
              </Button>
            </AddressContainer>
            <Input
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
                <Label>GPS 갱신 주기 (초)</Label>
                <Input
                  type="number"
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

const AddressContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const AddressInput = styled(Input)`
  flex: 1;
  background-color: ${({ theme }) => theme.palette.action.hover};
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

export default AdminCompanyRegisterModal; 