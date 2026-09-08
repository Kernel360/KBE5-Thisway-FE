import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from '../../src/theme';
import TripHistoryPage from '../../src/pages/trip/TripHistoryPage';

createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}><MemoryRouter><TripHistoryPage /></MemoryRouter></ThemeProvider>,
);
