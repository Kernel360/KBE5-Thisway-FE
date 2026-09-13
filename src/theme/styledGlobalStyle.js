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
  a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, [tabindex]:focus-visible {
    outline: 3px solid #2563eb;
    outline-offset: 3px;
  }
  button, input, select, textarea { font: inherit; }
  body { font-variant-numeric: tabular-nums; }
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
    padding: 24px;
    width: 100%;
    max-width: none;
    @media (max-width: 767px) { min-height: auto; padding: 22px 16px; }
  }
  
  .page-header-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 0;
    margin-bottom: 24px;
  }
  
  .page-header {
    font-size: 24px;
    line-height: 36px;
    letter-spacing: -0.02em;
    font-weight: 600;
    color: ${({ theme }) => theme.palette.text.secondary};
    margin-bottom: 8px;
    @media (max-width: 767px) { font-size: 22px; line-height: 30px; }
  }
  
  .page-header-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }
  
  .page-description {
    color: ${({ theme }) => theme.palette.text.primary};
    font-size: 14px;
    line-height: 1.7;
  }
  
  
  /* Table Styles */
  .table-container {
    background-color: ${({ theme }) => theme.palette.background.paper};
    border: 1px solid #e3e9ee;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(21,36,45,.025);
    overflow-x: auto;
    margin-bottom: 24px;
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .table-head {
    background-color: ${({ theme }) => theme.palette.grey[100]};
    border-bottom: 1px solid ${({ theme }) => theme.palette.grey[200]};
  }
  
  .table-row {
    &:not(:last-child) {
      border-bottom: 1px solid ${({ theme }) => theme.palette.grey[200]};
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

  .empty-cell {
    padding: 40px 20px;
    text-align: center;
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

  /* Dialog Styles */
  .dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  
  .dialog-content {
    position: relative;
    background: ${({ theme }) => theme.palette.background.paper};
    padding: 24px;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
    z-index: 1001;
  }
  
  .dialog-title {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 16px;
    color: ${({ theme }) => theme.palette.text.primary};
  }
  
  .dialog-text {
    margin: 0 0 8px;
    color: ${({ theme }) => theme.palette.text.primary};
  }
  
  .dialog-sub-text {
    margin: 0 0 24px;
    color: ${({ theme }) => theme.palette.text.primary};
  }
  
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  /* Stat Styles */
  .stats-grid {
    display: grid;
    gap: 16px;
  }
  
 .stats-card {
    background-color: ${({ theme }) => theme.palette.background.paper};
    border: 1px solid #e3e9ee;
    border-radius: 8px;
    padding: 24px;
  }
  
  .stat-title {
    font-size: 14px;
    color: ${({ theme }) => theme.palette.text.secondary};
    margin-bottom: 8px;
  }
`;

export default StyledGlobalStyle;
