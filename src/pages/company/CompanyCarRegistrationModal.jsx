import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../../components/Button';
import CarModelSearchModal from './CarModelSearchModal';

// 차량번호 유효성 검사 정규식 (백엔드와 동일)
const CAR_NUMBER_PATTERN = /^(\d{2,3}[가-힣]{1}\s?\d{4}|[가-힣]{2}\s?[가-힣]{1}\s?\d{4}|[가-힣]{1}\s?\d{4}|[가-힣]{1}\s?\d{2}[가-힣]{1}\s?\d{4})$/;
const INVALID_PATTERN = /[가-힣]{3,}/;

const CompanyCarRegistrationModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  error, 
  setError,
  mode = 'register',
  initialData = null
}) => {
  const [modelId, setModelId] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [color, setColor] = useState('');
  const [modelSearchOpen, setModelSearchOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setModelId(null);
      setSelectedModel(null);
      setVehicleNumber('');
      setColor('');
      setError && setError('');
    } else if (initialData && mode === 'edit') {
      setModelId(initialData.modelId || null);
      setSelectedModel(initialData.selectedModel || null);
      setVehicleNumber(initialData.vehicleNumber || '');
      setColor(initialData.color || '');
    }
  }, [isOpen, initialData, mode, setError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!modelId || !selectedModel) {
      setError('차량 모델을 선택해주세요.');
      return;
    }

    // 차량번호 유효성 검사 추가
    const normalizedCarNumber = vehicleNumber.replace(/\s/g, "");
    if (INVALID_PATTERN.test(normalizedCarNumber)) {
      setError('차량번호에 한글이 3글자 이상 연속으로 올 수 없습니다.');
      return;
    }
    if (!CAR_NUMBER_PATTERN.test(normalizedCarNumber)) {
      setError('차량번호 형식이 올바르지 않습니다.\n예) 12가3456, 123가4567, 서울가1234');
      return;
    }

    const carData = {
      vehicleModelId: selectedModel.id,
      carNumber: vehicleNumber,
      color,
    };

    try {
      await onSubmit(carData);
    } catch (error) {
      console.error('차량 등록 오류:', error);
    }
  };

  const handleModelSelect = (model) => {
    setModelId(model.id);
    setSelectedModel(model);
    setModelSearchOpen(false);
  };

  const isEditMode = mode === 'edit';
  const title = isEditMode ? '차량 수정' : '차량 등록';
  const submitText = isEditMode ? '수정' : '등록';
  const description = isEditMode ? '차량 정보를 수정해주세요' : '새로운 차량 정보를 등록해주세요';

  if (!isOpen) return null;

  return (
    <>
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>🚗 {title}</ModalTitle>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </ModalHeader>

          <Description>{description}</Description>

          {error && <ErrorMessage>{error}</ErrorMessage>}

        <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>차량 모델 *</Label>
              <ModelSelectContainer>
                <ModelInput
                  type="text"
                  value={selectedModel ? `${selectedModel.manufacturer} ${selectedModel.modelName} (${selectedModel.year}년형)` : ''}
                  placeholder="차량 모델을 선택해주세요"
                  readOnly
                />
                <Button
                  onClick={() => setModelSearchOpen(true)}
                  type="button"
                >
                  모델 검색
                </Button>
              </ModelSelectContainer>
            </FormGroup>

            <FormGroup>
              <Label>차량번호 *</Label>
              <Input
                type="text"
              value={vehicleNumber}
              onChange={(e) => {
                setVehicleNumber(e.target.value);
                setError && setError('');
              }}
              placeholder="12가 3456"
              required
            />
            </FormGroup>

            <FormGroup>
              <Label>색상 *</Label>
              <Input
                type="text"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setError && setError('');
              }}
              placeholder="흰색, 검정색, 회색 등"
              required
            />
            </FormGroup>

            <ButtonGroup>
            <Button
              onClick={onClose}
                type="button"
                variant="outlined"
            >
              취소
            </Button>
              <Button type="submit">
              {submitText}
            </Button>
            </ButtonGroup>
        </form>
        </ModalContent>
      </ModalOverlay>

      <CarModelSearchModal
        isOpen={modelSearchOpen}
        onClose={() => setModelSearchOpen(false)}
        onSelect={handleModelSelect}
      />
    </>
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
  width: 90%;
  max-width: 380px;
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: 8px;
  padding: 24px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.palette.text.secondary};
  
  &:hover {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

const Description = styled.p`
  margin: 0 0 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
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

const ModelSelectContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ModelInput = styled(Input)`
  flex: 1;
  background-color: ${({ theme }) => theme.palette.action.hover};
  cursor: default;
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
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  white-space: pre-line;
  
  &::before {
    content: "⚠️";
    margin-right: 8px;
  }
`;

export default CompanyCarRegistrationModal;