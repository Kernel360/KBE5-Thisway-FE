import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { authApi } from '../../utils/api';
import SearchInput from '../../components/SearchInput';
import Button from '../../components/Button';

const CompanySearchModal = ({ isOpen, onClose, onSelect }) => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await authApi.get('/admin/companies');
      setCompanies(response.data.companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('업체 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.crn.includes(searchTerm)
  );

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>업체 선택</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <SearchContainer>
          <SearchInput
            placeholder="업체명 또는 사업자등록번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <CompanyList>
          {loading ? (
            <LoadingText>로딩 중...</LoadingText>
          ) : error ? (
            <ErrorText>{error}</ErrorText>
          ) : filteredCompanies.length === 0 ? (
            <EmptyText>검색 결과가 없습니다.</EmptyText>
          ) : (
            filteredCompanies.map(company => (
              <CompanyItem
                key={company.id}
                onClick={() => onSelect(company)}
              >
                <CompanyName>{company.name}</CompanyName>
                <CompanyInfo>
                  <span>사업자번호: {company.crn}</span>
                  <span>연락처: {company.contact}</span>
                </CompanyInfo>
                <CompanyAddress>{company.addrRoad} {company.addrDetail}</CompanyAddress>
              </CompanyItem>
            ))
          )}
        </CompanyList>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div.attrs(() => ({
  className: 'dialog-overlay'
}))`
  z-index: 1002;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div.attrs(() => ({
  className: 'dialog-content'
}))`
  width: 90%;
  max-width: 600px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  z-index: 1003;
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: 8px;
  padding: 24px;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h2.attrs(() => ({
  className: 'dialog-title'
}))`
  margin: 0;
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

const SearchContainer = styled.div`
  margin-bottom: 16px;
`;

const CompanyList = styled.div`
  overflow-y: auto;
  max-height: calc(80vh - 140px);
`;

const CompanyItem = styled.div`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

const CompanyName = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const CompanyInfo = styled.div`
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-bottom: 4px;
`;

const CompanyAddress = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 20px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const ErrorText = styled.div`
  text-align: center;
  padding: 20px;
  color: ${({ theme }) => theme.palette.error.main};
`;

const EmptyText = styled.div`
  text-align: center;
  padding: 20px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export default CompanySearchModal; 