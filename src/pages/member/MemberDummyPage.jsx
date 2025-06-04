import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

const MemberDummyPage = ({ pageName }) => {
  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        {pageName} (준비 중)
      </Typography>
      <Typography color="text.secondary">
        해당 페이지는 현재 준비 중입니다.
      </Typography>
    </Box>
  );
};

MemberDummyPage.propTypes = {
  pageName: PropTypes.string.isRequired,
};

export default MemberDummyPage;
