import React, { useState, useEffect, useId } from 'react';
import styled from 'styled-components';
import Dialog from '@mui/material/Dialog';
import { authApi } from '../../utils/api';
import SearchInput from '../../components/SearchInput';

const CompanySearchModal = ({ isOpen, onClose, onSelect }) => {
  const titleId = useId();
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
      setError('');
      const response = await authApi.get('/admin/companies');
      setCompanies(response.data.companies);
    } catch (error) {
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
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby={titleId}
      PaperProps={{ sx: { m: 2, width: 'calc(100% - 32px)', maxHeight: 'calc(100dvh - 32px)' } }}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle id={titleId}>업체 선택</ModalTitle>
          <CloseButton type="button" aria-label="닫기" onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <SearchContainer>
          <SearchInput
            width="100%"
            placeholder="불러온 업체명 또는 사업자등록번호 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <CompanyList>
          {loading ? (
            <LoadingText role="status">로딩 중...</LoadingText>
          ) : error ? (
            <ErrorText role="alert">{error}</ErrorText>
          ) : filteredCompanies.length === 0 ? (
            <EmptyText>검색 결과가 없습니다.</EmptyText>
          ) : (
            filteredCompanies.map(company => (
              <CompanyItem
                type="button"
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
    </Dialog>
  );
};

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: ${({ theme }) => theme.palette.background.paper};
  padding: 24px;
  @media (max-width: 420px) { padding: 20px 16px; }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h2`
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 10px;
  flex-shrink: 0;
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

const CompanyItem = styled.button`
  width: 100%;
  background: white;
  text-align: left;
  font: inherit;
  color: inherit;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

const CompanyName = styled.span`
  display: block;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const CompanyInfo = styled.span`
  display: flex;
  gap: 4px 16px;
  flex-wrap: wrap;
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-bottom: 4px;
`;

const CompanyAddress = styled.span`
  display: block;
  overflow-wrap: anywhere;
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
  color: ${({ theme }) => theme.palette.error.contrastText};
`;

const EmptyText = styled.div`
  text-align: center;
  padding: 20px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export default CompanySearchModal; 