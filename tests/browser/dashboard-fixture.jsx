import React, { Profiler } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from '../../src/theme';
import CompanyDashboardPage from '../../src/pages/company/CompanyDashboardPage';

let commits = 0;
createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <MemoryRouter>
      <Profiler id="dashboard" onRender={() => {
        // Stop a regression from leaving the test browser in an unbounded render loop.
        if (++commits > 100) throw new Error('Dashboard exceeded 100 render commits');
      }}>
        <CompanyDashboardPage />
      </Profiler>
    </MemoryRouter>
  </ThemeProvider>,
);
