import { test, expect } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const output = 'docs/redesign/2026-09-13/v4-implementation';
const token = role => `fixture.${Buffer.from(JSON.stringify({sub:'ui-review@example.test',companyId:1,roles:[role],exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.fixture`;
const vehicle = {id:1,manufacturer:'현대',model:'아반떼',modelYear:2025,carNumber:'12가3456',color:'흰색',mileage:1000,powerOn:true};
async function session(page, role='COMPANY_CHEF') {
  await page.addInitScript(value=>localStorage.setItem('token',value),token(role));
}
async function vehicles(page) {
  await page.route('**/api/vehicles?**',r=>r.fulfill({json:{vehicles:[vehicle],totalPages:1,totalElements:1}}));
  await page.route('**/api/vehicle-models**',r=>r.fulfill({json:{vehicleModels:[{id:37,manufacturer:'현대',model:'아반떼',modelYear:2025}],pageInfo:{totalPages:1}}}));
}
async function capture(page,name) {
  await mkdir(output,{recursive:true});
  await page.screenshot({path:`${output}/${name}.png`,fullPage:true,animations:'disabled'});
}
async function originalLogo(page) {
  const logo=page.getByRole('img',{name:/Thisway Logo/i});
  await expect(logo).toBeVisible();
  const response=await page.request.get(await logo.getAttribute('src'));
  const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
  expect(digest(await response.body())).toBe(digest(await readFile('src/assets/logo.png')));
  const ratio=await logo.evaluate(img=>({actual:img.getBoundingClientRect().width/img.getBoundingClientRect().height,natural:img.naturalWidth/img.naturalHeight,filter:getComputedStyle(img).filter}));
  expect(ratio.actual).toBeCloseTo(ratio.natural,2);expect(ratio.filter).toBe('none');
}
for (const width of [1440,390]) test(`original blue logo and usable login at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.goto('/login');
  await originalLogo(page);await expect(page.getByLabel('이메일',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await capture(page,`login-${width}`);
});
test('vehicle workspace keeps logo, inline registration, mobile menu and focus',async({page})=>{
  await session(page);await vehicles(page);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:1000});await page.goto('/company/car-management');
  await expect(page.getByRole('link',{name:'12가3456',exact:true})).toBeVisible();await originalLogo(page);
  await capture(page,'vehicles-desktop');
  await page.getByRole('button',{name:'차량 등록',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByRole('radio')).toBeVisible();
  const drawer = await page.getByRole('dialog').boundingBox();expect(drawer.width).toBe(560);expect(drawer.x + drawer.width).toBe(1440);
  await expect(page.getByRole('dialog').getByRole('button',{name:'차량 등록',exact:true})).toBeDisabled();
  await capture(page,'registration-desktop');await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});const menu=page.getByRole('button',{name:'업무 메뉴 열기'});
  await menu.click();await expect(page.getByRole('link',{name:'구성원 관리',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'차량 관리',exact:true}).focus();await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();await expect(menu).toHaveAttribute('aria-expanded','false');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await capture(page,'vehicles-mobile');
  await page.getByRole('button',{name:'차량 등록',exact:true}).click();
  const mobileDialog=page.getByRole('dialog');expect((await mobileDialog.boundingBox()).width).toBe(390);
  for(let i=0;i<12;i++){await page.keyboard.press('Tab');expect(await mobileDialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);}
  await capture(page,'registration-mobile');await page.keyboard.press('Escape');expect(errors).toEqual([]);
});
test('company admin menu does not expose company-chief member management',async({page})=>{
  await session(page,'COMPANY_ADMIN');await vehicles(page);await page.goto('/company/car-management');
  await expect(page.getByRole('heading',{name:'차량 관리',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'구성원 관리',exact:true})).toHaveCount(0);
});
test('platform forms have mobile focus trap, labels and return focus',async({page})=>{
  await session(page,'ADMIN');await page.setViewportSize({width:390,height:844});
  await page.route('**/api/admin/members**',r=>r.fulfill({json:{members:[],pageInfo:{totalElements:0,totalPages:0}}}));
  await page.route('**/api/admin/companies**',r=>r.fulfill({json:{companies:[],pageInfo:{totalElements:0,totalPages:0}}}));
  await page.goto('/');await expect(page).toHaveURL(/\/admin\/manage$/);
  await page.getByRole('button',{name:'업체',exact:true}).click();const trigger=page.getByRole('button',{name:'업체 등록',exact:true});
  await trigger.click();const dialog=page.getByRole('dialog');await expect(dialog.getByLabel('업체명',{exact:true})).toBeVisible();
  for(let i=0;i<15;i++){await page.keyboard.press('Tab');expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await capture(page,'platform-company-form-mobile');await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(trigger).toBeFocused();
});
test('trip search accurately filters only the current server page and retains pagination',async({page})=>{
  await session(page);const queries=[];
  await page.route('**/api/trip-log?**',r=>{queries.push(new URL(r.request().url()).search);return r.fulfill({json:{tripLogs:[{Id:1,carNumber:'12가3456',startTime:'2026-09-01T09:00:00',endTime:'2026-09-01T10:00:00',tripMeter:500}],totalPages:2,totalElements:11}});});
  await page.goto('/company/trip-history');await expect(page.getByText('0.5 km',{exact:true})).toBeVisible();
  await page.getByLabel('현재 페이지에서 차량번호 찾기').fill('없는번호');await page.getByRole('button',{name:'찾기',exact:true}).click();
  await expect(page.getByText('현재 페이지에 일치하는 차량번호가 없습니다.')).toBeVisible();
  await expect(page.getByRole('button',{name:'2',exact:true})).toBeVisible();
  expect(queries).toHaveLength(1);expect(queries[0]).not.toMatch(/dateFrom|dateTo|carNumber/);
});
test('map failure preserves fleet data and explicit retry recovers with a controlled SDK',async({page})=>{
  await session(page);let loads=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/vehicles/dashboard',r=>r.fulfill({json:{totalVehicles:2,powerOnVehicles:1,powerOffVehicles:1}}));
  await page.route('**/api/vehicles/track?**',r=>r.fulfill({json:{vehicles:[{vehicleId:1,carNumber:'12가3456',lat:37.5,lng:127,powerOn:true}],pageInfo:{totalPages:1,totalElements:1}}}));
  await page.route('https://dapi.kakao.com/**',r=>{
    loads++;if(loads===1)return r.abort();
    return r.fulfill({contentType:'application/javascript',body:`window.kakao={maps:{load:cb=>cb(),LatLng:class{constructor(a,b){this.a=a;this.b=b}getLat(){return this.a}getLng(){return this.b}},Map:class{constructor(el,o){this.c=o.center}getCenter(){return this.c}setCenter(c){this.c=c}relayout(){window.mapRelayouts=(window.mapRelayouts||0)+1}},CustomOverlay:class{setMap(){}},event:{addListener(){},removeListener(){}}}};`});
  });
  await page.setViewportSize({width:1440,height:1000});await page.goto('/company/dashboard');
  await expect(page.getByText('지도를 불러오지 못했습니다.',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'12가3456',exact:true})).toBeVisible();
  await capture(page,'dashboard-map-failure');
  const listPanel=page.getByRole('region',{name:'차량 관제 목록'});
  const mapPanel=page.getByRole('region',{name:'관제 지도 패널'});
  const listRect=await listPanel.boundingBox(),mapRect=await mapPanel.boundingBox();
  expect(listRect.height).toBeGreaterThanOrEqual(560);expect(mapRect.height).toBe(listRect.height);
  expect(listRect.width).toBe(320);expect(mapRect.width).toBeGreaterThan(listRect.width);
  expect(Math.abs(listRect.y-mapRect.y)).toBeLessThan(1);
  expect(mapRect.x-(listRect.x+listRect.width)).toBeCloseTo(16,0);
  expect(await page.locator('aside').evaluate(el=>el.getBoundingClientRect().width)).toBe(216);
  await page.getByRole('button',{name:'지도 다시 시도',exact:true}).click();
  await expect(page.getByText('지도를 불러오지 못했습니다.',{exact:true})).toHaveCount(0);
  await expect.poll(()=>loads).toBe(2);await expect.poll(()=>page.evaluate(()=>window.mapRelayouts||0)).toBeGreaterThan(0);
  await page.setViewportSize({width:390,height:844});
  const map=page.getByLabel('차량 위치 지도');expect((await map.boundingBox()).height).toBeLessThanOrEqual(440);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
  await capture(page,'dashboard-mobile');
});

test('dedicated registration follows the model-first layout on desktop and mobile',async({page})=>{
  await session(page);await vehicles(page);
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:1000});await page.goto('/company/car-registration');
    await expect(page.getByRole('heading',{name:'차량 등록',exact:true})).toBeVisible();
    await expect(page.getByRole('radio')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await capture(page,`registration-page-${width}`);
  }
});
