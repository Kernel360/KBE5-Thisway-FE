const globalStyles = (theme) => ({
    "*": { margin: 0, padding: 0, boxSizing: "border-box" },
    body: {
        fontFamily: theme.typography.fontFamily,
        lineHeight: theme.typography.lineHeight,
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
    }
});

export default globalStyles;