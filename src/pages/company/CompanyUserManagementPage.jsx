import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { authApi } from "../../utils/api";
import CompanyUserRegisterModal from "./CompanyUserRegisterModal";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";

const emptyUser = () => ({ name: "", email: "", phone: "", memo: "", role: "MEMBER", password: "", confirmPassword: "" });
const roles = { COMPANY_CHEF: "회사 책임자", COMPANY_ADMIN: "관리자", MEMBER: "일반 사용자" };
const failureMessage = error => {
  if (String(error.response?.data?.code) === "12001") return "이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.";
  switch (error.response?.status) {
    case 400: return "입력 형식과 길이를 확인해주세요.";
    case 401: return "로그인이 만료되었습니다. 다시 로그인해주세요.";
    case 403: return "이 작업을 수행할 권한이 없습니다.";
    case 404: return "대상 사용자가 없거나 접근할 수 없습니다. 목록을 새로 확인해주세요.";
    default: return "요청을 완료하지 못했습니다. 연결 상태를 확인하고 다시 시도해주세요.";
  }
};

export default function CompanyUserManagementPage() {
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState({totalElements:0,totalPages:0});
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState({page:1, term:"", revision:0});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [summaryError, setSummaryError] = useState(false);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const requestVersion = useRef(0);
  const submitting = useRef(false);
  const refresh = () => setQuery(q => ({...q, revision:q.revision+1}));

  useEffect(() => {
    const controller = new AbortController();
    const version = ++requestVersion.current;
    const current = () => !controller.signal.aborted && version === requestVersion.current;
    setLoading(true); setLoadError(""); setSummary(null); setSummaryError(false);
    const config = {signal:controller.signal};
    authApi.get("/company-chef/members", {...config, params:{page:query.page-1,size:10,memberName:query.term}})
      .then(({data}) => {
        if (!current()) return;
        const lastPage = Math.max(1, data.pageInfo.totalPages);
        if (query.page > lastPage) { setQuery(q => ({...q,page:lastPage})); return; }
        setUsers(data.members); setPageInfo(data.pageInfo);
      }).catch(e => { if(current()) setLoadError("목록을 불러오지 못했습니다. " + failureMessage(e)); })
      .finally(() => { if(current()) setLoading(false); });
    authApi.get("/company-chef/members/summary",config)
      .then(({data}) => { if(current()) setSummary(data); })
      .catch(() => { if(current()) setSummaryError(true); });
    return () => controller.abort();
  }, [query]);

  const open = (mode,user=emptyUser()) => {setError("");setModal({mode,user:{...user}});};
  const close = () => {if(!submitting.current){setModal(null);setError("");}};
  const submit = async () => {
    if (submitting.current || !modal) return;
    submitting.current=true; setPending(true); setError("");
    const {mode,user} = modal;
    const body = {name:user.name.trim(),email:user.email.trim(),phone:user.phone,memo:user.memo||""};
    try {
      if(mode === "delete") await authApi.delete(`/company-chef/members/${user.id}`);
      else if(mode === "edit") await authApi.put(`/company-chef/members/${user.id}`,body);
      else await authApi.post("/company-chef/members",{...body,role:user.role,password:user.password});
      setModal(null); refresh();
    } catch(e) { setError(failureMessage(e)); }
    finally {submitting.current=false;setPending(false);}
  };
  return <Container>
    <Header><HeaderLeft><PageTitle>구성원 관리</PageTitle><PageDescription>소속 구성원의 계정과 접근 권한을 관리합니다.</PageDescription></HeaderLeft>
      <HeaderRight as="form" onSubmit={e=>{e.preventDefault();setQuery(q=>({page:1,term:searchInput.trim(),revision:q.revision+1}));}}>
        <input aria-label="사용자 이름 검색" placeholder="사용자 검색..." value={searchInput} maxLength={255}
          onChange={e=>setSearchInput(e.target.value)} style={{width:200,maxWidth:'100%',height:40}} />
        <Button type="submit">검색</Button><Button type="button" onClick={()=>open("register")}>사용자 등록</Button>
      </HeaderRight>
    </Header>
    <StatsGrid>
      <StatsCard><StatsTitle>전체 사용자</StatsTitle><StatsValue>{summary ? summary.companyChefCount+summary.companyAdminCount+summary.memberCount : "—"}</StatsValue></StatsCard>
      <StatsCard><StatsTitle>관리자</StatsTitle><StatsValue>{summary ? summary.companyChefCount+summary.companyAdminCount : "—"}</StatsValue></StatsCard>
      <StatsCard><StatsTitle>일반 사용자</StatsTitle><StatsValue>{summary?.memberCount ?? "—"}</StatsValue></StatsCard>
    </StatsGrid>
    {summaryError && <p role="alert">요약을 불러오지 못했습니다. <button onClick={refresh}>요약 다시 시도</button></p>}
    {loading ? <p role="status">목록을 불러오는 중입니다.</p> : loadError ? <div role="alert">{loadError} <Button onClick={refresh}>다시 시도</Button></div> : <>
      <p role="status">검색 결과 {pageInfo.totalElements}명</p>
      <TableContainer tabIndex={0} role="region" aria-label="구성원 목록"><Table>
        <TableHead><TableRow>{["번호","이름","이메일","연락처","권한","관리"].map(label=><TableHeaderCell key={label} scope="col">{label}</TableHeaderCell>)}</TableRow></TableHead>
        <TableBody>{users.length===0 ? <TableRow><EmptyCell colSpan={6}>{query.term ? "검색 결과가 없습니다." : "등록된 사용자가 없습니다."}</EmptyCell></TableRow> : users.map((user,index)=><TableRow key={user.id}>
          <TableCell>{(query.page-1)*10+index+1}</TableCell><TableCell>{user.name}</TableCell><TableCell>{user.email}</TableCell>
          <TableCell>{(user.phone||"").replace(/(\d{3})(\d{3,4})(\d{4})/,"$1-$2-$3")}</TableCell><TableCell>{roles[user.role]||user.role}</TableCell>
          <TableCell><ButtonGroup><ActionButton aria-label={`${user.name} 수정`} onClick={()=>open("edit",user)}>수정</ActionButton>
            <ActionButton aria-label={`${user.name} 삭제`} onClick={()=>open("delete",user)}>삭제</ActionButton></ButtonGroup></TableCell>
        </TableRow>)}</TableBody>
      </Table></TableContainer>
      {pageInfo.totalPages>0 && <Pagination currentPage={query.page} totalPages={pageInfo.totalPages} onPageChange={page=>setQuery(q=>({...q,page}))} />}
    </>}
    <CompanyUserRegisterModal isOpen={!!modal && modal.mode!=="delete"} mode={modal?.mode} user={modal?.user||{}}
      onClose={close} pending={pending} onChange={e=>{const {name,value}=e.target;if(!submitting.current)setModal(m=>({...m,user:{...m.user,[name]:value}}));}}
      onSubmit={submit} error={error} setError={setError} />
    <Dialog open={modal?.mode==="delete"} onClose={close} disableEscapeKeyDown={pending} aria-labelledby="member-delete-title" fullWidth maxWidth="xs">
      <DialogTitle id="member-delete-title">사용자 삭제 확인</DialogTitle><DialogContent>
        <p>{modal?.user.name} 사용자를 삭제하시겠습니까?</p><p>삭제 후 이 계정의 서비스 접근이 차단됩니다.</p>
        {error && <p role="alert">{error}</p>}
      </DialogContent><DialogActions><Button onClick={close} disabled={pending}>취소</Button><Button onClick={submit} disabled={pending}>{pending ? "삭제 중…" : "삭제"}</Button></DialogActions>
    </Dialog>
  </Container>;
}

const Container = styled.div.attrs(() => ({
  className: "page-container",
}))`min-width: 0; max-width: 100%;`;

const Header = styled.div.attrs(() => ({
  className: "page-header-wrapper",
}))`gap: 16px; @media(max-width: 700px) { flex-direction: column; align-items: stretch; }`;

const HeaderLeft = styled.div.attrs(() => ({
  className: "page-header",
}))`flex-shrink: 0;`;

const HeaderRight = styled.div.attrs(() => ({
  className: "page-header-actions",
}))`flex-wrap: wrap; input {padding: 0 12px; border: 1px solid #D5DFE6; border-radius: 10px; font: inherit;} button { white-space: nowrap; flex-shrink: 0; }`;

const PageTitle = styled.h1.attrs(() => ({
  className: "page-header",
}))``;

const PageDescription = styled.p`font-size: 14px; font-weight: 400; color: #617383; line-height: 1.6;`;

const StatsGrid = styled.div.attrs(() => ({
  className: "stats-grid",
}))`
  grid-template-columns: repeat(3, minmax(0, 1fr));
  @media(max-width: 600px) { gap: 8px; }
  margin-bottom: 24px;
`;

const StatsCard = styled.div.attrs(() => ({
  className: "stats-card",
}))`
  box-shadow: 0 1px 3px ${({ theme }) => theme.palette.action.hover};
`;

const StatsTitle = styled.h3.attrs(() => ({
  className: "stat-title",
}))`overflow-wrap: anywhere;`;

const StatsValue = styled.div`
  font-size: 28px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  min-width: 44px; min-height: 44px; padding: 8px 10px;
  border: 1px solid #E3E9EE; border-radius: 8px; background: white;
  color: #405666; font: inherit; font-size: 13px; cursor: pointer;
  &:hover { background: #F3F8F8; color: #087F8C; }
`;

const TableContainer = styled.div.attrs(() => ({
  className: "table-container",
}))`max-width: 100%; overflow-x: auto;`;

const Table = styled.table.attrs(() => ({
  className: "table",
}))`min-width: 680px;`;

const TableHead = styled.thead.attrs(() => ({
  className: "table-head",
}))``;

const TableBody = styled.tbody``;

const TableRow = styled.tr.attrs(() => ({
  className: "table-row",
}))``;

const TableHeaderCell = styled.th.attrs(() => ({
  className: "table-header-cell",
}))`
  width: ${({ width }) => width || "auto"};
`;

const TableCell = styled.td.attrs(() => ({
  className: "table-cell",
}))``;

const EmptyCell = styled.td.attrs(() => ({
  className: "empty-cell",
}))``;
