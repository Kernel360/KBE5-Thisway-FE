import { test, expect } from '@playwright/test';
const token = `fixture.${Buffer.from(JSON.stringify({sub:'fixture@example.test',companyId:1,roles:['COMPANY_CHEF'],exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.fixture`;
const vehicle = {id:1,manufacturer:'현대',model:'아반떼',modelYear:2025,carNumber:'12가3456',color:'흰색',mileage:1000,powerOn:false};
const list = (rows=[vehicle], total=rows.length) => ({vehicles:rows,totalPages:Math.ceil(total/10),totalElements:total});
async function session(page) {
 await page.addInitScript(v=>localStorage.setItem('token',v),token);
 await page.route('**/api/vehicle-models**',r=>r.fulfill({json:{vehicleModels:[{id:37,manufacturer:'현대',model:'아반떼',modelYear:2025}],pageInfo:{totalPages:2}}}));
}
test('register normalizes payload, locks pending and preserves inputs on duplicate',async({page})=>{
 await session(page);let release;const gate=new Promise(r=>release=r);let writes=0;
 await page.route('**/api/vehicles**',async r=>{if(r.request().method()==='POST'){writes++;expect(r.request().postDataJSON()).toEqual({vehicleModelId:37,carNumber:'12가3456',color:'흰색'});await gate;return r.fulfill({status:400,json:{code:14002}});}return r.fulfill({json:list([])});});
 await page.goto('/company/car-management');await page.getByRole('button',{name:'차량 등록',exact:true}).click();const d=page.getByRole('dialog');await d.getByRole('radio').check();await d.getByLabel('차량번호 *').fill('12가 3456');await d.getByLabel('색상 *').fill('흰색');await d.getByRole('button',{name:'차량 등록',exact:true}).click();await expect(d.getByLabel('차량번호 *')).toBeDisabled();await page.keyboard.press('Escape');await expect(d).toBeVisible();expect(writes).toBe(1);release();await expect(d.getByRole('alert')).toContainText('이미 등록');await expect(d.getByLabel('차량번호 *')).toHaveValue('12가 3456');
});
test('editing does not invent existing model ID and accepts empty 204',async({page})=>{
 await session(page);let patch;
 await page.route('**/api/vehicles**',r=>{if(r.request().method()==='PATCH'){patch=r.request().postDataJSON();return r.fulfill({status:204,body:''});}return r.fulfill({json:list()});});
 await page.goto('/company/car-management');await page.getByRole('button',{name:'12가3456 수정'}).click();const d=page.getByRole('dialog');await expect(d.getByText('현재 모델:',{exact:false})).toContainText('아반떼');await d.getByLabel('색상 *').fill('검정');await d.getByRole('button',{name:'변경 저장'}).click();await expect(d).toBeHidden();expect(patch).toEqual({carNumber:'12가3456',color:'검정'});await expect(page.getByRole('alert')).toContainText('수정되었습니다');
});
test('model zero matches retains page navigation and mobile dialog focus',async({page})=>{
 await session(page);await page.setViewportSize({width:390,height:844});await page.route('**/api/vehicles**',r=>r.fulfill({json:list()}));
 await page.goto('/company/car-management');const trigger=page.getByRole('button',{name:'차량 등록',exact:true});await trigger.click();const d=page.getByRole('dialog');await d.getByLabel('현재 페이지에서 모델 찾기').fill('없는모델');await expect(d.getByText('현재 페이지에 일치하는 모델이 없습니다.')).toBeVisible();await expect(d.getByRole('button',{name:'Go to page 2'})).toBeVisible();for(let i=0;i<12;i++){await page.keyboard.press('Tab');expect(await d.evaluate(el=>el.contains(document.activeElement))).toBe(true);}await page.keyboard.press('Escape');await expect(d).toBeHidden();await expect(trigger).toBeFocused();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('latest vehicle search wins when earlier response is delayed',async({page})=>{
 await session(page);let release;const gate=new Promise(r=>release=r);
 await page.route('**/api/vehicles**',async r=>{const q=new URL(r.request().url()).searchParams.get('carNumber');if(q==='A'){await gate;return r.fulfill({json:list([{...vehicle,carNumber:'A 결과'}])}).catch(()=>{});}return r.fulfill({json:list([{...vehicle,carNumber:q==='B'?'B 결과':'초기 차량'}])});});
 await page.goto('/company/car-management');await expect(page.getByRole('link',{name:'초기 차량',exact:true})).toBeVisible();await page.getByLabel('차량번호 검색').fill('A');const request=page.waitForRequest(r=>new URL(r.url()).searchParams.get('carNumber')==='A');await page.getByRole('button',{name:'검색',exact:true}).click();await request;await page.getByLabel('차량번호 검색').fill('B');await page.getByRole('button',{name:'검색',exact:true}).click();await expect(page.getByRole('link',{name:'B 결과',exact:true})).toBeVisible();release();await expect(page.getByRole('link',{name:'A 결과',exact:true})).toHaveCount(0);
});
test('last vehicle page deletion follows server count',async({page})=>{
 await session(page);let deleted=false;
 await page.route('**/api/vehicles**',r=>{if(r.request().method()==='DELETE'){deleted=true;return r.fulfill({status:204,body:''});}const pageIndex=new URL(r.request().url()).searchParams.get('page');return r.fulfill({json:list(pageIndex==='1'?(deleted?[]:[{...vehicle,id:11,carNumber:'마지막 차량'}]):[vehicle],deleted?10:11)});});
 await page.goto('/company/car-management');await page.getByRole('button',{name:'Go to page 2'}).click();await page.getByRole('button',{name:'마지막 차량 삭제'}).click();await page.getByRole('dialog').getByRole('button',{name:'삭제',exact:true}).click();await expect(page.getByRole('dialog')).toBeHidden();await expect(page.getByRole('link',{name:'12가3456',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Go to page 2'})).toHaveCount(0);
});
test('dedicated registration page shares payload and empty 201 completion without invented detail link',async({page})=>{
 await session(page);let payload;
 await page.route('**/api/vehicles**',r=>{payload=r.request().postDataJSON();return r.fulfill({status:201,body:''});});
 await page.goto('/company/car-registration');await page.getByRole('radio').check();await page.getByLabel('차량번호 *').fill('123가 4567');await page.getByLabel('색상 *').fill(' 회색 ');await page.getByRole('button',{name:'차량 등록',exact:true}).click();await expect(page.getByRole('alert')).toContainText('123가4567 차량이 등록되었습니다.');expect(payload).toEqual({vehicleModelId:37,carNumber:'123가4567',color:'회색'});await expect(page.getByRole('button',{name:'목록에서 확인'})).toBeVisible();await expect(page.getByRole('link',{name:'상세'})).toHaveCount(0);await page.getByRole('button',{name:'다른 차량 등록'}).click();await expect(page.getByLabel('차량번호 *')).toHaveValue('');
});
test('registration success remains distinct from follow-up list failure',async({page})=>{
 await session(page);let saved=false;
 await page.route('**/api/vehicles**',r=>{if(r.request().method()==='POST'){saved=true;return r.fulfill({status:201,body:''});}return r.fulfill(saved?{status:500,json:{}}:{json:list([])});});
 await page.goto('/company/car-management');await page.getByRole('button',{name:'차량 등록',exact:true}).click();const d=page.getByRole('dialog');await d.getByRole('radio').check();await d.getByLabel('차량번호 *').fill('12가3456');await d.getByLabel('색상 *').fill('흰색');await d.getByRole('button',{name:'차량 등록',exact:true}).click();await expect(d).toBeHidden();await expect(page.getByText('12가3456 차량이 등록되었습니다.')).toBeVisible();await expect(page.getByText('저장은 완료됐지만 목록을 갱신하지 못했습니다. 다시 불러와 확인해주세요.')).toBeVisible();
});
