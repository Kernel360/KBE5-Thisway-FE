// Production-build UI evidence; local synthetic identity, no real backend/account.
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const base='http://127.0.0.1:4193';
const browser=await chromium.launch();
const evidence=[];
try {
  for (const [name,width,height,route,role] of [
    ['login-desktop',1440,1000,'/login',null],
    ['login-mobile',390,844,'/login',null],
    ['admin-placeholder',1440,1000,'/admin/dashboard','ADMIN'],
    ['member-mobile',390,844,'/member/dashboard','MEMBER'],
  ]) {
    const context=await browser.newContext({viewport:{width,height}});
    if(role) await context.addInitScript(payload=>localStorage.setItem('token',`fixture.${btoa(JSON.stringify(payload))}.fixture`),{roles:[role],sub:'fixture@example.test',exp:Math.floor(Date.now()/1000)+600});
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.name));
    await page.route('**/api/**', r=>r.fulfill({status:403,json:{message:'isolated screen audit'}}));
    await page.goto(base+route,{waitUntil:'networkidle'});
    await page.screenshot({path:`docs/frontend-readiness/${name}.png`,fullPage:true});
    evidence.push({name,viewport:{width,height},pageErrors:errors,documentWidth:await page.evaluate(()=>document.documentElement.scrollWidth),scope:'Production UI, synthetic identity; backend API calls blocked. Not an authenticated backend end-to-end test.'});
    await context.close();
  }
  await writeFile('docs/frontend-readiness/result.json',JSON.stringify(evidence,null,2));
} finally {await browser.close();}
