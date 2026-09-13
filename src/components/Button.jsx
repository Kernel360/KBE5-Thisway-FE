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
      {startIcon && <IconWrapper aria-hidden="true">{startIcon}</IconWrapper>}
      {children}
      {endIcon && <IconWrapper aria-hidden="true">{endIcon}</IconWrapper>}
    </StyledButton>
  );
};

const getVariantStyles = ({ variant, color, theme }) => {
  const colors = {
    primary: theme.palette.primary,
    secondary: theme.palette.secondary,
    error: theme.palette.error
  };

  const baseColor = colors[color] || colors.primary;

  switch (variant) {
    case 'contained':
      return css`
        background-color: ${baseColor.main};
        color: ${baseColor.contrastText};
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
          background-color: ${baseColor.light || theme.palette.action.hover};
        }
      `;
    case 'text':
      return css`
        background-color: transparent;
        color: ${baseColor.contrastText};
        &:hover {
          background-color: ${baseColor.light || theme.palette.action.hover};
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
        min-height: 40px;
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
        min-height: 44px;
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
  border-radius: 10px;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  gap: 6px;
  transition: background-color 0.15s, border-color 0.15s;
  ${getVariantStyles}
  ${getSizeStyles}
  &:focus-visible { outline: 2px solid #087F8C; outline-offset: 3px; }
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
