import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import theme from '../../src/theme';
import CompanyStatisticsPage from '../../src/pages/company/CompanyStatisticsPage';

createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}><CompanyStatisticsPage /></ThemeProvider>,
);
