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

// 공식 로고 컴포넌트
const OfficialLogo = () => (
  <svg width="24" height="24" viewBox="0 0 100 100" style={{ marginRight: '8px' }}>
    <polygon 
      points="50,10 90,80 10,80" 
      fill="#4285f4"
      stroke="none"
    />
    <circle cx="25" cy="85" r="8" fill="#1a73e8" />
    <circle cx="75" cy="85" r="8" fill="#1a73e8" />
    <circle cx="25" cy="85" r="12" fill="none" stroke="white" strokeWidth="3" />
    <circle cx="75" cy="85" r="12" fill="none" stroke="white" strokeWidth="3" />
  </svg>
);

const menuItems = [
  { text: "대시보드", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "차량 관리", icon: <DirectionsCarIcon />, path: "/company/car-management" },
  { text: "사용자 관리", icon: <PeopleIcon />, path: "/company/user-management" },
  { text: "운행 기록", icon: <BusinessIcon />, path: "/company/trip-records" },
  { text: "설정", icon: <AdminPanelSettingsIcon />, path: "/company/settings" },
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
          fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        },
      }}
    >
      <Box>
        <Toolbar sx={{ minHeight: '56px !important', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <OfficialLogo />
            <Typography variant="h6" color="primary" fontWeight={700} sx={{ fontFamily: 'inherit', fontSize: '1.1rem' }}>
              Thisway
            </Typography>
          </Box>
        </Toolbar>
        <Divider />
        <List sx={{ py: 1 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                py: 1,
                px: 2,
                mx: 1,
                borderRadius: 2,
                "&.Mui-selected": {
                  backgroundColor: "primary.100",
                  color: "primary.main",
                  fontWeight: 700,
                },
                "&:hover": {
                  backgroundColor: "grey.50",
                  borderRadius: 2,
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                <Box sx={{ fontSize: 20 }}>{item.icon}</Box>
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 700 : 500
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 1.5 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32, fontSize: '0.875rem' }}>
            관
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.primary" fontWeight={700} sx={{ fontFamily: 'inherit', fontSize: '0.875rem' }}>
              업체 admin
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'inherit', fontSize: '0.75rem' }}>
              admin@carmonitor.com
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
