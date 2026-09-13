import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import styled from 'styled-components';
import Button from '../../components/Button';

export default function CompanyUserRegisterModal({isOpen,onClose,user,onChange,onSubmit,mode='register',error,setError,pending=false}) {
  const registering = mode === 'register';
  const title = registering ? '사용자 등록' : '사용자 수정';
  const field = (name,label,props={}) => <label htmlFor={`member-${name}`}>
    {label}<input id={`member-${name}`} name={name} value={user[name]||''} onChange={onChange} {...props}/>
  </label>;
  const submit = e => {
    e.preventDefault();
    if(pending) return;
    if(!user.name?.trim()) {setError('이름을 입력해주세요.');return;}
    if(registering && !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(user.password)) {
      setError('비밀번호는 영문·숫자·특수문자(!@#$%^&*)를 포함한 8~20자로 입력해주세요.');return;
    }
    if(registering && user.password!==user.confirmPassword) {setError('비밀번호가 일치하지 않습니다.');return;}
    onSubmit();
  };
  return <Dialog open={isOpen} onClose={onClose} disableEscapeKeyDown={pending} aria-labelledby="member-form-title" fullWidth maxWidth="sm"
    PaperProps={{sx:{margin:2,width:'calc(100% - 32px)',maxHeight:'calc(100% - 32px)'}}}>
    <DialogTitle id="member-form-title">{title}</DialogTitle>
    <DialogContent dividers>
      <Form id="member-form" onSubmit={submit}>
        {error && <p role="alert">{error}</p>}
        <fieldset disabled={pending}>
          <div className="fields">
            {field('name','이름 *',{required:true,maxLength:255,autoComplete:'off',autoFocus:true})}
            {field('phone','연락처 *',{required:true,pattern:'010[0-9]{8}',maxLength:11,inputMode:'tel',title:'010으로 시작하는 숫자 11자리'})}
          </div>
          {field('email','이메일 *',{required:true,type:'email',maxLength:255,autoComplete:'off'})}
          {registering && <>
            <div className="fields">
              {field('password','비밀번호 *',{required:true,type:'password',minLength:8,maxLength:20,autoComplete:'new-password','aria-describedby':'member-password-help'})}
              {field('confirmPassword','비밀번호 확인 *',{required:true,type:'password',maxLength:20,autoComplete:'new-password'})}
            </div>
            <p id="member-password-help">영문·숫자·특수문자(!@#$%^&*) 포함 8~20자</p>
            <label htmlFor="member-role">권한 *<select id="member-role" name="role" value={user.role} onChange={onChange}>
              <option value="MEMBER">일반 사용자</option><option value="COMPANY_ADMIN">관리자</option><option value="COMPANY_CHEF">회사 책임자</option>
            </select></label>
          </>}
          <label htmlFor="member-memo">메모<textarea id="member-memo" name="memo" value={user.memo||''} onChange={onChange} maxLength={255} rows={3}/></label>
        </fieldset>
      </Form>
    </DialogContent>
    <DialogActions><Button type="button" onClick={onClose} disabled={pending}>취소</Button>
      <Button type="submit" form="member-form" disabled={pending}>{pending ? '저장 중…' : registering ? '등록' : '수정'}</Button>
    </DialogActions>
  </Dialog>;
}
const Form = styled.form`
  fieldset {border:0;padding:0;margin:0;min-width:0;}
  label {display:block;margin:12px 0;font-size:14px;}
  input,select,textarea {display:block;box-sizing:border-box;width:100%;margin-top:6px;padding:10px;border:1px solid #D5DFE6;border-radius:10px;min-height:44px;font:inherit;}
  input:focus-visible,select:focus-visible,textarea:focus-visible {outline:2px solid #087F8C;outline-offset:2px;}
  textarea {resize:vertical;}
  .fields {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
  p {font-size:13px;}
  [role=alert] {color:#a21520;}
  @media(max-width:600px){.fields{grid-template-columns:1fr;gap:0;}}
`;
