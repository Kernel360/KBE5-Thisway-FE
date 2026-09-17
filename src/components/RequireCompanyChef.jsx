import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { getUserRole } from '../utils/auth';
import useUserStore from '../store/userStore';

export default function RequireCompanyChef({ children }) {
  useUserStore(state => state.token);
  const role = getUserRole();
  if (!role) return <Navigate to="/login" replace />;
  if (role !== 'COMPANY_CHEF') return <main style={{padding:32}}>
    <h1>접근 권한이 없습니다</h1><p>구성원 관리는 회사 책임자만 이용할 수 있습니다.</p>
    <Link to="/">처음으로</Link>
  </main>;
  return children;
}
