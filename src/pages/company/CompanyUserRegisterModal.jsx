import React from 'react';
import styled from 'styled-components';

const CompanyUserRegisterModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onChange, 
  onSubmit, 
  mode = 'register', // 'register' or 'edit'
  error,
  setError
}) => {
  if (!isOpen) return null;

  const isEditMode = mode === 'edit';
  const title = isEditMode ? '사용자 수정' : '사용자 등록';
  const submitText = isEditMode ? '수정' : '등록';

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user.name || !user.email || !user.phone) {
      setError("필수 항목을 모두 입력해주세요.");
      return;
    }

    if (mode === 'register') {
      if (!user.password) {
        setError("비밀번호를 입력해주세요.");
        return;
      }
      if (user.password !== user.confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    const submitData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      memo: user.memo || ""
    };

    onSubmit(submitData, mode);
  };

  return (
    <Modal>
      <ModalOverlay onClick={onClose} />
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          <form onSubmit={handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <FormGrid>
              <FormColumn>
                <FormGroup>
                  <Label>이름 *</Label>
                  <Input
                    name="name"
                    value={user.name || ""}
                    onChange={onChange}
                    placeholder="이름 입력"
                    required
                  />
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <Label>연락처 *</Label>
                  <Input
                    name="phone"
                    value={user.phone || ""}
                    onChange={onChange}
                    placeholder="01012345678"
                    required
                  />
                </FormGroup>
              </FormColumn>
            </FormGrid>

            <FormGroup>
              <Label>이메일 *</Label>
              <Input
                type="email"
                name="email"
                value={user.email || ""}
                onChange={onChange}
                placeholder="이메일 입력"
                required
              />
            </FormGroup>

            {mode === 'register' && (
              <>
                <FormGrid>
                  <FormColumn>
                    <FormGroup>
                      <Label>비밀번호 *</Label>
                      <Input
                        type="password"
                        name="password"
                        value={user.password || ""}
                        onChange={onChange}
                        placeholder="비밀번호 입력"
                        required
                      />
                    </FormGroup>
                  </FormColumn>
                  <FormColumn>
                    <FormGroup>
                      <Label>비밀번호 확인 *</Label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={user.confirmPassword || ""}
                        onChange={onChange}
                        placeholder="비밀번호 확인"
                        required
                      />
                    </FormGroup>
                  </FormColumn>
                </FormGrid>

                <FormGroup>
                  <Label>권한 *</Label>
                  <RadioGroup>
                    <RadioLabel>
                      <RadioInput
                        type="radio"
                        name="role"
                        value="COMPANY_CHEF"
                        checked={user.role === "COMPANY_CHEF"}
                        onChange={onChange}
                      />
                      최고 관리자
                    </RadioLabel>
                    <RadioLabel>
                      <RadioInput
                        type="radio"
                        name="role"
                        value="COMPANY_ADMIN"
                        checked={user.role === "COMPANY_ADMIN"}
                        onChange={onChange}
                      />
                      관리자
                    </RadioLabel>
                    <RadioLabel>
                      <RadioInput
                        type="radio"
                        name="role"
                        value="MEMBER"
                        checked={user.role === "MEMBER"}
                        onChange={onChange}
                      />
                      일반 사용자
                    </RadioLabel>
                  </RadioGroup>
                </FormGroup>

              </>
            )}

            <FormGroup>
              <Label>메모</Label>
              <TextArea
                  name="memo"
                  value={user.memo || ""}
                  onChange={onChange}
                  placeholder="추가 정보 입력"
                  rows={3}
              />
            </FormGroup>

            <ModalFooter>
              <CancelButton type="button" onClick={onClose}>취소</CancelButton>
              <SubmitButton type="submit">
                {mode === "register" ? "등록" : "수정"}
              </SubmitButton>
            </ModalFooter>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  position: relative;
  width: 600px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1001;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[200]};
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${({ theme }) => theme.palette.text.secondary};
  cursor: pointer;
  padding: 4px;
  line-height: 1;

  &:hover {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.palette.grey[200]};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const FormColumn = styled.div``;

const FormGroup = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const Input = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.palette.grey[50]};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.palette.grey[50]};
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const RadioInput = styled.input`
  cursor: pointer;
  width: 16px;
  height: 16px;
  margin: 0;
  
  &:checked {
    accent-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const CancelButton = styled.button`
  height: 44px;
  padding: 0 24px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 4px;
  background-color: white;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.palette.grey[50]};
  }
`;

const SubmitButton = styled.button`
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: white;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.palette.primary.dark};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.palette.error.contrastText};
  background-color: ${({ theme }) => theme.palette.error.main};
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  
  &::before {
    content: "⚠️";
    margin-right: 8px;
  }
`;

export default CompanyUserRegisterModal; 