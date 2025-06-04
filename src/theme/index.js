import { createTheme } from "@mui/material/styles";
import palette from "./palette";

const theme = createTheme({
  palette,
  typography: {
    fontFamily: ["Noto Sans KR", "Inter", "Gmarket Sans", "sans-serif"].join(","),
    lineHeight: 1.5,
    h1: {
      fontWeight: 700,
      fontSize: "20px",
    },
    h2: {
      fontWeight: 700,
      fontSize: "32px",
    },
    h3: {
      fontWeight: 500,
      fontSize: "24px",
    },
    body1: {
      fontSize: "16px",
    },
  },
});

export default theme;
