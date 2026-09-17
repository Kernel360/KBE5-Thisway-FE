import { test, expect } from '@playwright/test';
const path = '/company/user-management';
const token = role => `fixture.${Buffer.from(JSON.stringify({sub:'fixture@example.test',companyId:1,roles:[role],exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.fixture`;
async function session(page, role='COMPANY_CHEF') {
  await page.addInitScript(value=>localStorage.setItem('token',value),token(role));
}
for (const role of ['ADMIN','COMPANY_ADMIN','MEMBER']) test(`${role} cannot mount member management`,async({page})=>{
  await session(page,role); let calls=0;
  await page.route('**/api/company-chef/members**',r=>{calls++;return r.fulfill({json:{}})});
  await page.goto(path);
  await expect(page.getByRole('heading',{name:'접근 권한이 없습니다'})).toBeVisible();
  expect(calls).toBe(0);
  expect(await page.evaluate(()=>localStorage.getItem('token'))).toBeTruthy();
});
test('failed list is distinct from empty and retry recovers',async({page})=>{
  await session(page); let fails=true;
  await page.route('**/api/company-chef/members**',r=>r.fulfill(r.request().url().endsWith('/summary')?{json:{companyChefCount:1,companyAdminCount:0,memberCount:0}}:fails?{status:500,json:{}}:{json:{members:[],pageInfo:{totalElements:0,totalPages:0}}}));
  await page.goto(path);
  await expect(page.getByRole('alert')).toContainText('목록');
  await expect(page.getByText('등록된 사용자가 없습니다.')).toHaveCount(0);
  fails=false; await page.getByRole('button',{name:'다시 시도'}).click();
  await expect(page.getByText('등록된 사용자가 없습니다.')).toBeVisible();
});

const user=(id,name='합성 사용자')=>({id,name,email:`fixture-${id}@example.test`,phone:'01012345678',memo:'',role:'MEMBER'});
const list=(members,total=members.length)=>({members,pageInfo:{totalElements:total,totalPages:Math.ceil(total/10)}});
async function form(page){const d=page.getByRole('dialog');await d.getByLabel('이름 *',{exact:true}).fill('등록 사용자');await d.getByLabel('연락처 *').fill('01012345678');await d.getByLabel('이메일 *').fill('new@example.test');await d.getByLabel('비밀번호 *',{exact:true}).fill('Password123!');await d.getByLabel('비밀번호 확인 *').fill('Password123!');return d;}

test('latest search wins and searching sends one list request',async({page})=>{
 await session(page);let release;const gate=new Promise(r=>release=r);let bCalls=0;
 await page.route('**/api/company-chef/members**',async r=>{const u=new URL(r.request().url());if(u.pathname.endsWith('/summary'))return r.fulfill({json:{companyChefCount:0,companyAdminCount:0,memberCount:1}});const term=u.searchParams.get('memberName');if(term==='A'){await gate;return r.fulfill({json:list([user(1,'A 결과')])}).catch(()=>{});}if(term==='B')bCalls++;return r.fulfill({json:list([user(2,term==='B'?'B 결과':'초기 결과')])});});
 await page.goto(path);await expect(page.getByText('초기 결과',{exact:true})).toBeVisible();
 await page.getByLabel('사용자 이름 검색').fill('A');const a=page.waitForRequest(r=>new URL(r.url()).searchParams.get('memberName')==='A');await page.getByRole('button',{name:'검색',exact:true}).click();await a;
 await page.getByLabel('사용자 이름 검색').fill('B');await page.getByRole('button',{name:'검색',exact:true}).click();await expect(page.getByText('B 결과',{exact:true})).toBeVisible();release();
 await expect(page.getByText('A 결과',{exact:true})).toHaveCount(0);expect(bCalls).toBe(1);
});

test('mutation locks input, preserves duplicate error input and refetches current filter',async({page})=>{
 await session(page);let release;let gate=new Promise(r=>release=r);let writes=0;let saved=false;const terms=[];
 await page.route('**/api/company-chef/members**',async r=>{const u=new URL(r.request().url());if(r.request().method()==='POST'){writes++;if(writes===1){await gate;return r.fulfill({status:400,json:{code:'12001'}});}saved=true;return r.fulfill({status:201,body:''});}if(u.pathname.endsWith('/summary'))return r.fulfill({json:{companyChefCount:0,companyAdminCount:0,memberCount:saved?2:1}});terms.push(u.searchParams.get('memberName'));return r.fulfill({json:list(saved?[user(1,'등록 사용자')]:[])});});
 await page.goto(path);await page.getByLabel('사용자 이름 검색').fill('등록');await page.getByRole('button',{name:'검색',exact:true}).click();await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible();await page.getByRole('button',{name:'사용자 등록',exact:true}).click();const d=await form(page);await d.getByRole('button',{name:'등록',exact:true}).click();
 await expect(d.getByLabel('이름 *',{exact:true})).toBeDisabled();await expect(d.getByRole('button',{name:'저장 중…'})).toBeDisabled();await page.keyboard.press('Escape');await expect(d).toBeVisible();expect(writes).toBe(1);release();
 await expect(d.getByRole('alert')).toContainText('이미 사용 중인 이메일');await expect(d.getByLabel('이름 *',{exact:true})).toHaveValue('등록 사용자');await d.getByRole('button',{name:'등록',exact:true}).click();await expect(d).toBeHidden();await expect(page.getByText('등록 사용자',{exact:true})).toBeVisible();expect(terms.at(-1)).toBe('등록');
});

test('last page deletion follows server page count, failures remain in dialog',async({page})=>{
 await session(page);let deleted=false,attempt=0;
 await page.route('**/api/company-chef/members**',r=>{const u=new URL(r.request().url());if(r.request().method()==='DELETE'){attempt++;if(attempt===1)return r.fulfill({status:500,json:{}});deleted=true;return r.fulfill({status:204,body:''});}if(u.pathname.endsWith('/summary'))return r.fulfill({json:{companyChefCount:0,companyAdminCount:0,memberCount:deleted?10:11}});return r.fulfill({json:list(u.searchParams.get('page')==='1'?(deleted?[]:[user(11,'마지막 사용자')]):Array.from({length:10},(_,i)=>user(i+1,`사용자 ${i+1}`)),deleted?10:11)});});
 await page.goto(path);await page.getByRole('button',{name:'2',exact:true}).click();await page.getByRole('button',{name:'마지막 사용자 삭제'}).click();const d=page.getByRole('dialog');await d.getByRole('button',{name:'삭제',exact:true}).click();await expect(d.getByRole('alert')).toBeVisible();await d.getByRole('button',{name:'삭제',exact:true}).click();await expect(d).toBeHidden();await expect(page.getByText('검색 결과 10명')).toBeVisible();await expect(page.getByText('사용자 1',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'2',exact:true})).toHaveCount(0);
});

test('mobile dialog scroll, focus trap, Escape and focus restoration',async({page})=>{
 await session(page);await page.setViewportSize({width:390,height:844});await page.route('**/api/company-chef/members**',r=>r.fulfill({json:r.request().url().endsWith('/summary')?{companyChefCount:0,companyAdminCount:0,memberCount:0}:list([])}));
 await page.goto(path);expect((await page.getByRole('heading',{name:'구성원 관리',exact:true}).boundingBox()).height).toBeLessThan(60);const trigger=page.getByRole('button',{name:'사용자 등록',exact:true});await trigger.click();const d=page.getByRole('dialog');await expect(d.getByLabel('이름 *',{exact:true})).toBeFocused();await expect(d.getByRole('button',{name:'등록',exact:true})).toBeInViewport();
 for(let i=0;i<15;i++){await page.keyboard.press('Tab');expect(await d.evaluate(el=>el.contains(document.activeElement))).toBe(true);}
 await page.keyboard.press('Escape');await expect(d).toBeHidden();await expect(trigger).toBeFocused();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

for(const failure of [403,404,'network']) test(`delete ${failure} preserves dialog and server counts`,async({page})=>{
 await session(page);
 await page.route('**/api/company-chef/members**',r=>{
  if(r.request().method()==='DELETE')return failure==='network'?r.abort('failed'):r.fulfill({status:failure,json:{}});
  return r.fulfill({json:r.request().url().endsWith('/summary')?{companyChefCount:0,companyAdminCount:0,memberCount:1}:list([user(1)])});
 });
 await page.goto(path);await page.getByRole('button',{name:'합성 사용자 삭제'}).click();const d=page.getByRole('dialog');await d.getByRole('button',{name:'삭제',exact:true}).click();
 await expect(d.getByRole('alert')).toContainText(failure===403?'권한':failure===404?'대상 사용자':'연결 상태');await d.getByRole('button',{name:'취소'}).click();
 await expect(page.getByText('검색 결과 1명')).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('token'))).toBeTruthy();
});

test('editing a name out of the active filter removes the row through a server read',async({page})=>{
 await session(page);let saved=false;const terms=[];
 await page.route('**/api/company-chef/members**',r=>{
  const u=new URL(r.request().url());if(r.request().method()==='PUT'){saved=true;expect(r.request().postDataJSON()).not.toHaveProperty('role');return r.fulfill({status:200,body:''});}
  if(u.pathname.endsWith('/summary'))return r.fulfill({json:{companyChefCount:0,companyAdminCount:0,memberCount:1}});
  terms.push(u.searchParams.get('memberName'));return r.fulfill({json:list(saved?[]:[user(1,'원래 이름')])});
 });
 await page.goto(path);await page.getByLabel('사용자 이름 검색').fill('원래');await page.getByRole('button',{name:'검색',exact:true}).click();await page.getByRole('button',{name:'원래 이름 수정'}).click();
 const d=page.getByRole('dialog');await d.getByLabel('이름 *',{exact:true}).fill('변경 이름');await d.getByRole('button',{name:'수정',exact:true}).click();
 await expect(d).toBeHidden();await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible();expect(terms.at(-1)).toBe('원래');
});
