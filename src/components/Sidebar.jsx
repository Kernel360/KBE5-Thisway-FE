import React from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import defaultProfile from "../assets/default-profile.png";

function Sidebar() {
  const location = useLocation();
  const userRole = 'ADMIN'; // 예시일 뿐 추후 API 연결하고 수정.

  const menuItems = [
    { label: '대시보드', path: '/admin/dashboard', roles: ['ADMIN'] },
    { label: '기업 관리', path: '/admin/company', roles: ['ADMIN'] },
    { label: '사용자 관리', path: '/admin/user', roles: ['ADMIN', 'COMPANY_ADMIN'] },
    { label: '차량 승인', path: '/admin/vehicle-approval', roles: ['ADMIN'] },
    { label: '차량 관리', path: '/company/car-management', roles: ['COMPANY_CHEF', 'COMPANY_ADMIN'] },
    { label: '차량 상세', path: '/company/car-detail', roles: ['COMPANY_CHEF', 'COMPANY_ADMIN'] },
  ]

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <SidebarContainer>
      <LogoSection>
        <LogoImage src={logo} alt="Thisway Logo" />
        <LogoTitle> THIS WAY </LogoTitle>
      </LogoSection>
      <Nav>
        <NavList>
          {filteredMenuItems.map(item => (
            <NavItem key = {item.path}>
              <NavLink
                as={Link}
                to={item.path}
                $active={location.pathname === item.path}
              >
                {item.label}
              </NavLink>
            </NavItem>
          ))}
        </NavList>
      </Nav>
      <MemberInfo>
        <MemberProfile>
          <ProfileImage>
            <img src={defaultProfile} alt="Member Profile" />
          </ProfileImage>
          <ProfileText>
            <MemberLabel>관리자</MemberLabel>
            <MemberEmail>admin@thisway.com</MemberEmail>
          </ProfileText>
        </MemberProfile>
      </MemberInfo>
    </SidebarContainer>
  )
}

export default Sidebar;

const SidebarContainer = styled.aside`
  width: 250px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 10px 20px 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
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
  color: #1E3A8A;
  font-size: 23px;
  font-weight: 700;
`;

const Nav = styled.nav`
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
  background-color: ${({ $active, theme }) => ($active ? theme.palette.secondary.main : "transparent")};
  color: ${({ $active, theme }) => ($active ? theme.palette.secondary.contrastText : theme.palette.text.disabled)};
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
