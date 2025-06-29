import React from 'react';
import styled from 'styled-components';

const PAGE_GROUP_SIZE = 10;

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // 현재 페이지가 속한 그룹의 시작/끝 계산
  const currentGroup = Math.floor((currentPage - 1) / PAGE_GROUP_SIZE);
  const groupStart = currentGroup * PAGE_GROUP_SIZE + 1;
  const groupEnd = Math.min(groupStart + PAGE_GROUP_SIZE - 1, totalPages);
  const pages = Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i);

  const hasPrevGroup = groupStart > 1;
  const hasNextGroup = groupEnd < totalPages;

  return (
    <Container>
      <PaginationWrapper>
        <PaginationArrow 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {'<'}
        </PaginationArrow>
        {hasPrevGroup && (
          <PaginationArrow onClick={() => onPageChange(groupStart - 1)}>
            ...
          </PaginationArrow>
        )}
        {pages.map((page) => (
          <PageButton
            key={page}
            active={currentPage === page}
            onClick={() => onPageChange(page)}
          >
            {page}
          </PageButton>
        ))}
        {hasNextGroup && (
          <PaginationArrow onClick={() => onPageChange(groupEnd + 1)}>
            ...
          </PaginationArrow>
        )}
        <PaginationArrow 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {'>'}
        </PaginationArrow>
      </PaginationWrapper>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PaginationArrow = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: ${({ disabled, theme }) => 
    disabled ? theme.palette.grey[300] : theme.palette.primary.main};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  font-size: 16px;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.palette.primary.dark};
  }
`;

const PageButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: ${({ active, theme }) => 
    active ? theme.palette.primary.main : 'transparent'};
  color: ${({ active, theme }) => 
    active ? theme.palette.common.white : theme.palette.text.primary};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background-color: ${({ active, theme }) => 
      active ? theme.palette.primary.main : theme.palette.action.hover};
  }
`;

export default Pagination; 