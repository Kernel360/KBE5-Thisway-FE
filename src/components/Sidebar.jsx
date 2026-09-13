import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import DirectionsCarOutlined from "@mui/icons-material/DirectionsCarOutlined";
import RouteOutlined from "@mui/icons-material/RouteOutlined";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import PeopleOutline from "@mui/icons-material/PeopleOutline";
import MenuRounded from "@mui/icons-material/MenuRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import logo from "../assets/logo.png";
import defaultProfile from "../assets/default-profile.png";
import useUserStore from "@/store/userStore";

const roleLabels = {
  ADMIN: "플랫폼 관리자", COMPANY_CHEF: "회사 책임자",
  COMPANY_ADMIN: "회사 관리자", MEMBER: "일반 구성원",
};

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const userRole = ["ADMIN", "COMPANY_CHEF", "COMPANY_ADMIN", "MEMBER"]
    .find((role) => user?.roles?.includes(role));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const profileRef = useRef(null);
  const accountButtonRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    setDropdownOpen(false);
    setNavigationOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeOutside = (event) => {
      if (!profileRef.current?.contains(event.target)) setDropdownOpen(false);
    };
    if (dropdownOpen) document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [dropdownOpen]);

  const companyMenu = [
    { label: "운영 현황", path: "/company/dashboard", icon: DashboardOutlined },
    { label: "차량 관리", path: "/company/car-management", icon: DirectionsCarOutlined },
    { label: "운행 기록", path: "/company/trip-history", icon: RouteOutlined },
    { label: "통계", path: "/company/statistics", icon: BarChartOutlined },
    ...(userRole === "COMPANY_CHEF"
      ? [{ label: "구성원 관리", path: "/company/user-management", icon: PeopleOutline }]
      : []),
  ];
  const items = userRole === "ADMIN"
    ? [{ label: "사용자/업체 관리", path: "/admin/manage", icon: PeopleOutline }]
    : ["COMPANY_CHEF", "COMPANY_ADMIN"].includes(userRole) ? companyMenu : [];
  const isActive = (path) => location.pathname === path
    || (path === "/company/car-management" && /^\/company\/car-(detail|registration)/.test(location.pathname))
    || (path === "/company/trip-history" && location.pathname === "/company/trip-detail");

  return (
    <SidebarContainer>
      <BrandRow>
        <LogoSection>
          <LogoImage src={logo} alt="Thisway Logo" />
          <BrandText><LogoTitle>THIS WAY</LogoTitle><BrandSubtitle>플릿 관제 시스템</BrandSubtitle></BrandText>
        </LogoSection>
        <MobileToggle ref={menuButtonRef} type="button" aria-label={navigationOpen ? "업무 메뉴 닫기" : "업무 메뉴 열기"}
          aria-expanded={navigationOpen} aria-controls="workspace-navigation" onClick={() => setNavigationOpen((value) => !value)}>
          {navigationOpen ? <CloseRounded /> : <MenuRounded />}
        </MobileToggle>
      </BrandRow>
      <Nav id="workspace-navigation" aria-label="업무 메뉴" $open={navigationOpen} onKeyDown={(event) => {
        if (event.key === "Escape") { setNavigationOpen(false); menuButtonRef.current?.focus(); }
      }}>
        <NavList>
          {items.map(({ label, path, icon: Icon }) => (
            <li key={path}>
              <NavLink to={path} $active={isActive(path)} aria-current={isActive(path) ? "page" : undefined}>
                <Icon aria-hidden="true" fontSize="small" /><span>{label}</span>
              </NavLink>
            </li>
          ))}
        </NavList>
        {userRole === "MEMBER" && <Unavailable>일반 구성원 전용 화면은 준비 중입니다.</Unavailable>}
      </Nav>
      <MemberInfo ref={profileRef} onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setDropdownOpen(false);
      }} onKeyDown={(event) => {
        if (event.key === "Escape") { setDropdownOpen(false); accountButtonRef.current?.focus(); }
      }}>
        <MemberProfile ref={accountButtonRef} type="button" aria-label="계정 메뉴" aria-expanded={dropdownOpen}
          aria-controls={dropdownOpen ? "account-actions" : undefined} onClick={() => setDropdownOpen((value) => !value)}>
          <ProfileImage src={defaultProfile} alt="" />
          <ProfileText>
            <MemberLabel>{user ? roleLabels[userRole] || "권한 확인 필요" : "로그인 필요"}</MemberLabel>
            <MemberEmail>{user?.sub || "이메일 정보 없음"}</MemberEmail>
          </ProfileText>
          <ExpandMoreRounded aria-hidden="true" fontSize="small" />
        </MemberProfile>
        {dropdownOpen && <DropdownMenu id="account-actions">
          <DropdownItem type="button" onClick={() => { setDropdownOpen(false); navigate("/logout"); }}>
            <LogoutRounded aria-hidden="true" fontSize="small" />로그아웃
          </DropdownItem>
        </DropdownMenu>}
      </MemberInfo>
    </SidebarContainer>
  );
}
export default Sidebar;

const SidebarContainer = styled.aside`
  width: 216px; height: 100dvh; position: sticky; top: 0; z-index: 100;
  flex-shrink: 0; display: flex; flex-direction: column;
  padding: 0; background: #142235; border-right: 1px solid #e3e9ee;
  @media (max-width: 767px) { width: 100%; height: auto; position: relative; padding: 0; border-right: 0; border-bottom: 1px solid #e3e9ee; }
`;
const BrandRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  height: 64px; min-height: 64px; padding: 0 16px; background: white; border-bottom: 1px solid #e3e9ee;
  @media (max-width: 767px) { padding: 0 16px; }
`;
const LogoSection = styled.div`display: flex; align-items: center; gap: 12px;`;
const LogoImage = styled.img`height: 32px; width: auto; object-fit: contain; flex-shrink: 0;`;
const BrandText = styled.div`display: flex; flex-direction: column; gap: 3px;`;
const LogoTitle = styled.span`color: #1e3a8a; font-size: 18px; font-weight: 700; line-height: 1.1; white-space: nowrap; letter-spacing: -.025em;`;
const BrandSubtitle = styled.span`font-size: 11px; line-height: 1.25; color: #64748b;`;
const MobileToggle = styled.button`
  display: none; width: 44px; height: 44px; border: 1px solid #e3e9ee; border-radius: 10px; background: white; color: #15242d; cursor: pointer;
  @media (max-width: 767px) { display: inline-flex; align-items: center; justify-content: center; }
`;
const Nav = styled.nav`
  flex: 1; min-height: 0; overflow-y: auto; padding: 12px;
  @media (max-width: 767px) { display: ${({ $open }) => $open ? "block" : "none"}; margin-top: 0; }
`;
const NavList = styled.ul`list-style: none; display: grid; gap: 4px; padding: 0;`;
const NavLink = styled(Link)`
  position: relative; display: flex; align-items: center; gap: 12px; min-height: 40px; padding: 10px 12px; line-height: 20px;
  border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: ${({ $active }) => $active ? 600 : 500};
  background: ${({ $active }) => $active ? "#2563EB" : "transparent"}; color: ${({ $active }) => $active ? "#FFFFFF" : "#CBD5E1"};
  &::before { content: ""; position: absolute; left: 0; top: 6px; bottom: 6px; width: 3px; border-radius: 3px; background: ${({ $active }) => $active ? "#2563eb" : "transparent"}; }
  &:hover { background: #243650; color: #FFFFFF; }
  @media (max-width: 767px) { min-height: 44px; }
`;
const Unavailable = styled.p`padding: 12px; color: #657681; font-size: 13px; line-height: 1.7;`;
const MemberInfo = styled.div`border-top: 1px solid #e3e9ee; padding: 12px; margin-top: auto; position: relative;
  @media (max-width: 767px) { margin-top: 0; padding: 10px 16px; }
`;
const MemberProfile = styled.button`
  width: 100%; display: flex; align-items: center; gap: 10px; border: 0; border-radius: 10px; background: transparent;
  padding: 6px; text-align: left; font: inherit; color: #CBD5E1; cursor: pointer; &:hover { background: #243650; }
`;
const ProfileImage = styled.img`width: 32px; height: 32px; flex-shrink: 0; border-radius: 50%; object-fit: cover;`;
const ProfileText = styled.span`flex: 1; min-width: 0;`;
const MemberLabel = styled.span`display: block; color: #F8FAFC; font-size: 13px; font-weight: 650; margin-bottom: 3px;`;
const MemberEmail = styled.span`display: block; color: #CBD5E1; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`;
const DropdownMenu = styled.div`
  position: absolute; left: 12px; right: 12px; bottom: calc(100% + 8px); background: white; border: 1px solid #e3e9ee;
  border-radius: 12px; box-shadow: 0 8px 24px rgba(21,36,45,.09); padding: 6px; z-index: 10;
  @media (max-width: 767px) { bottom: auto; top: calc(100% + 8px); }
`;
const DropdownItem = styled.button`
  width: 100%; display: flex; align-items: center; gap: 10px; min-height: 44px; border: 0; background: transparent;
  border-radius: 8px; padding: 10px 12px; font: inherit; font-size: 14px; color: #526570; cursor: pointer;
  &:hover { background: #e5f3f3; color: #1D4ED8; }
`;
