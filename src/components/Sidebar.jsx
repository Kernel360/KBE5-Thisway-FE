import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { text: "대시보드", icon: <DashboardIcon />, path: "/admin/dashboard" },
  { text: "기업 관리", icon: <BusinessIcon />, path: "/admin/company" },
  { text: "사용자 관리", icon: <PeopleIcon />, path: "/admin/user" },
  {
    text: "차량 승인",
    icon: <DirectionsCarIcon />,
    path: "/admin/vehicle-approval",
  },
];

const drawerWidth = 220;

const Sidebar = () => {
  const location = useLocation();
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "background.paper",
          borderRight: "1px solid #E5E7EB",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
      }}
    >
      <Box>
        <Toolbar>
          <Typography variant="h6" color="primary" fontWeight={700}>
            Thisway
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "primary.100",
                  color: "primary.main",
                  fontWeight: 700,
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 28, height: 28 }}>
            <AdminPanelSettingsIcon fontSize="small" />
          </Avatar>
          <Typography variant="body2" color="text.secondary" fontWeight={700}>
            관리자
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
