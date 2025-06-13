import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SearchInput from '../../components/SearchInput';
import Pagination from '../../components/Pagination';
import { authApi } from '../../utils/api';

const CarModelSearchModal = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  const fetchModels = async (page = 1) => {
    try {
      setLoading(true);
      const response = await authApi.get(`/vehicle-models?page=${page - 1}&size=${itemsPerPage}`);
      if (response.data) {
        setModels(response.data.vehicleModels);
        setTotalPages(response.data.pageInfo.totalPages);
      }
    } catch (error) {
      console.error('Error fetching vehicle models:', error);
      setError('차량 모델 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchModels(currentPage);
    }
  }, [isOpen, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredModels = models.filter(model =>
    model.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>차량 모델 검색</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <SearchContainer>
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="제조사 또는 모델명으로 검색"
          />
        </SearchContainer>

        <ModelList>
          {loading ? (
            <LoadingText>로딩 중...</LoadingText>
          ) : error ? (
            <ErrorText>{error}</ErrorText>
          ) : filteredModels.length === 0 ? (
            <EmptyText>검색 결과가 없습니다.</EmptyText>
          ) : (
            filteredModels.map((model) => (
              <ModelItem key={model.id} onClick={() => onSelect({
                id: model.id,
                manufacturer: model.manufacturer,
                modelName: model.model,
                year: model.modelYear
              })}>
                <ModelName>{model.manufacturer} {model.model}</ModelName>
                <ModelYear>{model.modelYear}년형</ModelYear>
              </ModelItem>
            ))
          )}
        </ModelList>

        {!loading && !error && filteredModels.length > 0 && (
          <PaginationContainer>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </PaginationContainer>
        )}
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
  width: 90%;
  max-width: 500px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  z-index: 1001;
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
  font-weight: 600;
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

const ModelList = styled.div`
  overflow-y: auto;
  flex: 1;
  margin-bottom: 16px;
`;

const ModelItem = styled.div`
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

const ModelName = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const ModelYear = styled.div`
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

const PaginationContainer = styled.div`
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;

export default CarModelSearchModal; 