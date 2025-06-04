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
  .page-header {
    font-size: 30px;
    font-weight: 700;
    color: ${({ theme }) => theme.palette.text.secondary};
    margin-bottom: 16px;
  }
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
`;
export default StyledGlobalStyle;
