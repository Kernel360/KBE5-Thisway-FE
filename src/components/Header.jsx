import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

const Header = () => {
  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={1}
      sx={{ zIndex: 1201 }}
    >
      <Toolbar>
        {/* 좌측 로고/타이틀 */}
        <Typography
          variant="h6"
          color="primary"
          fontWeight={700}
          sx={{ flexGrow: 1 }}
        >
          Thisway Admin
        </Typography>
        {/* 우측 알림/아바타 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="primary">
            <NotificationsIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: "primary.main" }}>A</Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
