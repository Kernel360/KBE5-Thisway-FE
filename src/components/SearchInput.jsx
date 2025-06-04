import React from 'react';
import styled from 'styled-components';

const SearchInput = ({ placeholder = "검색...", value, onChange, width = "240px" }) => {
  return (
    <StyledInput
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      width={width}
    />
  );
};

const StyledInput = styled.input.attrs(() => ({
  className: 'search-input'
}))`
  width: ${({ width }) => width};
  height: 40px;
  padding: 0 16px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }

  &::placeholder {
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

export default SearchInput; 