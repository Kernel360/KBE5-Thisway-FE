import React from "react";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import theme from "@/theme";
import App from "@/App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <MuiThemeProvider theme={theme}>
    <StyledThemeProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StyledThemeProvider>
  </MuiThemeProvider>,
);
