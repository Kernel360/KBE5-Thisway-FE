const globalStyles = (theme) => ({
    "*": { margin: 0, padding: 0, boxSizing: "border-box" },
    body: {
        fontFamily: theme.typography.fontFamily,
        lineHeight: theme.typography.lineHeight,
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
    },
    ".app": {
        display: "flex",
        height: "100vh",
    },
    ".main-content": {
        flex: 1,
        padding: "20px",
        overflowY: "auto",
    },
    ".page-header h1": {
        fontSize: "24px",
        fontWeight: "700",
        color: theme.palette.text.secondary,
        marginBottom: "16px",
    },
    ".header-content": {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
    },
});

export default globalStyles;