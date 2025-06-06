import { createGlobalStyle } from 'styled-components';

const StyledGlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    line-height: ${({ theme }) => theme.typography.lineHeight};
    color: ${({ theme }) => theme.palette.text.primary};
    background-color: ${({ theme }) => theme.palette.background.default};
  }
  .app {
    display: flex;
    height: 100vh;
  }
  .main-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
  
  /* Page Layout Styles */
  .page-container {
    min-height: 100vh;
    background-color: ${({ theme }) => theme.palette.background.default};
    padding: 4px 24px;
  }
  
  .page-header-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 16px;
    margin-bottom: 10px;
  }
  
  .page-header {
    font-size: 20px;
    font-weight: 700;
    color: ${({ theme }) => theme.palette.text.secondary};
    margin-bottom: 10px;
  }
  
  .page-header-actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  
  .page-description {
    color: ${({ theme }) => theme.palette.text.primary};
    font-size: 16px;
  }
  
  
  /* Table Styles */
  .table-container {
    background-color: ${({ theme }) => theme.palette.background.paper};
    border-radius: 8px;
    box-shadow: 0 1px 3px ${({ theme }) => theme.palette.action.hover};
    overflow: hidden;
    margin-bottom: 24px;
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .table-head {
    background-color: ${({ theme }) => theme.palette.grey[100]};
    border-bottom: 2px solid ${({ theme }) => theme.palette.divider};
  }
  
  .table-row {
    &:not(:last-child) {
      border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
    }
    
    &:hover {
      background-color: ${({ theme }) => theme.palette.action.hover};
    }
  }
  
  .table-header-cell {
    padding: 16px;
    text-align: left;
    font-weight: 600;
    color: ${({ theme }) => theme.palette.text.primary};
    font-size: 14px;
  }
  
  .table-cell {
    padding: 16px;
    font-size: 14px;
    color: ${({ theme }) => theme.palette.text.primary};
  }


  /* Badge and Button Styles */
  .badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .action-button {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

export default StyledGlobalStyle;
