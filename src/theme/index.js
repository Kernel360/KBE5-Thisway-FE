import { createTheme } from "@mui/material/styles";
import palette from "./palette";

const theme = createTheme({
  palette,
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: ["Noto Sans KR", "Noto Sans", "sans-serif"].join(","),
    lineHeight: 1.6,
    h1: { fontWeight: 600, fontSize: "28px", lineHeight: "36px", letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, fontSize: "26px", lineHeight: 1.4, letterSpacing: "-0.025em" },
    h3: { fontWeight: 600, fontSize: "22px", lineHeight: 1.4 },
    body1: { fontSize: "15px", lineHeight: 1.6 },
    body2: { fontSize: "14px", lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 44, borderRadius: 10, paddingInline: 18 },
        textError: { color: '#B42318' },
        outlinedError: { color: '#B42318', borderColor: '#B42318' },
        containedError: { color: '#fff', backgroundColor: '#B42318', '&:hover': { backgroundColor: '#912018' } },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 14, boxShadow: "0 20px 70px rgba(21,36,45,.16)", backgroundImage: "none" },
      },
    },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 14 } } },
    MuiCssBaseline: { styleOverrides: { body: { fontVariantNumeric: "tabular-nums" } } },
  },
});

export default theme;
