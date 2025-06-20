import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import defaultProfile from "../assets/default-profile.png";
import useUserStore from "@/store/userStore";
import React, { useRef, useState } from "react";

// 역할 한글 변환 함수
const getRoleLabel = (role) => {
  switch (role) {
    case "ADMIN":
      return "시스템 관리자";
    case "COMPANY_CHEF":
      return "업체 관리자";
    case "COMPANY_ADMIN":
      return "업체 관리자";
    case "MEMBER":
      return "일반 사용자";
    default:
      return "알 수 없음";
  }
};

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const userRole = user?.roles?.includes("ADMIN")
    ? "ADMIN"
    : user?.roles?.includes("COMPANY_CHEF")
      ? "COMPANY_CHEF"
      : user?.roles?.includes("COMPANY_ADMIN")
        ? "COMPANY_ADMIN"
        : user?.roles?.includes("MEMBER")
          ? "MEMBER"
          : null;

  // 드롭다운 상태
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // 바깥 클릭 시 드롭다운 닫기
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // 권한별 메뉴 정의
  const adminMenu = [
    { label: "대시보드", path: "/admin/dashboard" },
    // { label: "차량 관리", path: "/admin/car-management" },
    { label: "사용자/업체 관리", path: "/admin/manage" },
    { label: "통계", path: "/admin/statistics" },
  ];
  const companyMenu = [
    { label: "대시보드", path: "/company/dashboard" },
    { label: "차량 관리", path: "/company/car-management" },
    // 사용자 관리는 COMPANY_CHEF만 볼 수 있음
    ...(userRole === "COMPANY_CHEF"
      ? [{ label: "구성원 관리", path: "/company/user-management" }]
      : []),
    { label: "운행 기록", path: "/company/trip-history" },
    { label: "통계", path: "/company/statistics" },
    { label: "설정", path: "/company/settings" },
  ];
  const memberMenu = [
    { label: "내 대시보드", path: "/member/dashboard" },
    { label: "차량 예약", path: "/member/car-reservation" },
    { label: "내 이용 내역", path: "/member/usage-history" },
    { label: "운행 일지", path: "/member/drive-log" },
    { label: "내 정보 관리", path: "/member/profile" },
    { label: "고객 센터", path: "/member/support" },
  ];

  let menuToShow = [];
  if (userRole === "ADMIN") menuToShow = adminMenu;
  else if (userRole === "COMPANY_ADMIN" || userRole === "COMPANY_CHEF")
    menuToShow = companyMenu;
  else if (userRole === "MEMBER") menuToShow = memberMenu;

  return (
    <SidebarContainer>
      <LogoSection>
        <LogoImage src={logo} alt="Thisway Logo" />
        <LogoTitle> THIS WAY </LogoTitle>
      </LogoSection>
      <Nav>
        <NavList>
          {menuToShow.map((item) => (
            <NavItem key={item.path}>
              <NavLink
                as={Link}
                to={item.path}
                $active={
                  location.pathname === item.path ||
                  (item.path === "/company/car-management" && location.pathname.startsWith("/company/car-detail")) ||
                  (item.path === "/company/trip-history" && location.pathname === "/company/trip-detail")
                }
              >
                {item.label}
              </NavLink>
            </NavItem>
          ))}
        </NavList>
      </Nav>
      <MemberInfo ref={profileRef}>
        <MemberProfile onClick={() => setDropdownOpen((v) => !v)} style={{ cursor: 'pointer', position: 'relative' }}>
          <ProfileImage>
            <img src={defaultProfile} alt="Member Profile" />
          </ProfileImage>
          <ProfileText>
            <MemberLabel>
              {user ? getRoleLabel(userRole) : "로그인 필요"}
            </MemberLabel>
            <MemberEmail>{user?.email || "이메일 정보 없음"}</MemberEmail>
          </ProfileText>
        </MemberProfile>
        {dropdownOpen && (
          <DropdownMenu>
            <DropdownItem onClick={() => { setDropdownOpen(false); navigate('/logout'); }}>
              로그아웃
            </DropdownItem>
          </DropdownMenu>
        )}
      </MemberInfo>
    </SidebarContainer>
  );
}

export default Sidebar;

const SidebarContainer = styled.aside`
  width: 250px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 15px 20px 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 100;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  height: 40px;
  margin-right: 16px;
`;

const LogoTitle = styled.h1`
  color: #1e3a8a;
  font-size: 23px;
  font-weight: 700;
`;

const Nav = styled.nav`
  margin-top: 20px;
  flex: 1;
`;

const NavList = styled.ul`
  list-style: none;
  margin-bottom: auto;
  padding: 0;
`;

const NavItem = styled.li`
  margin-bottom: 10px;
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.palette.text.disabled};
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 500;
  background-color: ${({ $active, theme }) =>
    $active ? theme.palette.secondary.main : "transparent"};
  color: ${({ $active, theme }) =>
    $active
      ? theme.palette.secondary.contrastText
      : theme.palette.text.disabled};
  font-weight: ${({ $active }) => ($active ? 700 : 500)};

  &:hover {
    background-color: ${({ theme }) => theme.palette.secondary.main};
    color: ${({ theme }) => theme.palette.secondary.contrastText};
  }
`;

const MemberInfo = styled.div`
  border-top: 1px solid #eee;
  padding-top: 20px;
  margin-top: 20px;
  position: relative;
`;

const MemberProfile = styled.div`
  display: flex;
  align-items: center;
`;

const ProfileImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfileText = styled.div`
  flex: 1;
`;

const MemberLabel = styled.span`
  display: block;
  font-weight: 700;
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 14px;
  margin-bottom: 2px;
`;

const MemberEmail = styled.span`
  display: block;
  color: ${({ theme }) => theme.palette.grey[400]};
  font-size: 13px;
  font-weight: 400;
`;

const DropdownMenu = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100%;
  margin-bottom: 8px;
  background: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid #eee;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  z-index: 10;
  padding: 0;
`;

const DropdownItem = styled.div`
  padding: 10px 0;
  text-align: center;
  color: ${({ theme }) => theme.palette.text.disabled};
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 0 0 8px 8px;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: ${({ theme }) => theme.palette.secondary.main};
    color: ${({ theme }) => theme.palette.secondary.contrastText};
  }
`;
