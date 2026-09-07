import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import theme from '../../src/theme';
import EmulatorPage from '../../src/pages/emulator/EmulatorPage';

createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}><EmulatorPage /></ThemeProvider>,
);
