import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from '../../src/theme';
import CompanyCarDetailPage from '../../src/pages/company/CompanyCarDetailPage';

createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <MemoryRouter initialEntries={['/vehicle/1']}>
      <Routes><Route path="/vehicle/:id" element={<CompanyCarDetailPage />} /></Routes>
    </MemoryRouter>
  </ThemeProvider>,
);
