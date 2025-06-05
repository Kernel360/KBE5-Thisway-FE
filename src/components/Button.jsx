import React from 'react';
import styled, { css } from 'styled-components';

const Button = ({ 
  children, 
  variant = 'contained', // contained, outlined, text
  color = 'primary', // primary, secondary, error
  size = 'medium', // small, medium, large
  startIcon,
  endIcon,
  fullWidth,
  disabled,
  onClick,
  ...props 
}) => {
  return (
    <StyledButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {startIcon && <IconWrapper>{startIcon}</IconWrapper>}
      {children}
      {endIcon && <IconWrapper>{endIcon}</IconWrapper>}
    </StyledButton>
  );
};

const getVariantStyles = ({ variant, color, theme }) => {
  const colors = {
    primary: theme.palette.primary,
    secondary: theme.palette.secondary,
    error: theme.palette.error
  };

  const baseColor = colors[color];

  switch (variant) {
    case 'contained':
      return css`
        background-color: ${baseColor.main};
        color: ${theme.palette.common.white};
        &:hover {
          background-color: ${baseColor.dark};
        }
      `;
    case 'outlined':
      return css`
        background-color: transparent;
        color: ${baseColor.main};
        border: 1px solid ${baseColor.main};
        &:hover {
          background-color: ${baseColor.lighter};
        }
      `;
    case 'text':
      return css`
        background-color: transparent;
        color: ${baseColor.main};
        &:hover {
          background-color: ${baseColor.lighter};
        }
      `;
    default:
      return '';
  }
};

const getSizeStyles = ({ size }) => {
  switch (size) {
    case 'small':
      return css`
        height: 32px;
        padding: 0 12px;
        font-size: 13px;
      `;
    case 'large':
      return css`
        height: 48px;
        padding: 0 24px;
        font-size: 16px;
      `;
    default: // medium
      return css`
        height: 40px;
        padding: 0 16px;
        font-size: 14px;
      `;
  }
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: ${({ variant, theme }) =>
    variant === 'outlined' ? 'transparent' : theme.palette.primary.main};
  color: ${({ variant, theme }) =>
    variant === 'outlined' ? theme.palette.primary.main : theme.palette.primary.contrastText};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${({ variant, theme }) =>
    variant === 'outlined' ? theme.palette.primary.main : 'transparent'};

  &:hover {
    background-color: ${({ variant, theme }) =>
      variant === 'outlined' ? theme.palette.action.hover : theme.palette.primary.dark};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.2em;
`;

export default Button; 