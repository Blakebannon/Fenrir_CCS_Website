import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
const routes = ['/', '/about', '/request-walkthrough', '/privacy'];
async function screenshot(page: Page, name: string) { await mkdir('review/screenshots', { recursive: true }); await page.locator('img').evaluateAll(images => images.forEach(image => image.setAttribute('loading', 'eager'))); await page.evaluate(() => Promise.all([...document.images].map(image => image.decode()))); await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0,0); }); await page.screenshot({ path: `review/screenshots/${name}.png`, fullPage: true }); }

test('pages, internal links, accessibility, responsive layout and review screenshots', async ({ page, request }, info) => {
  const jsErrors: string[] = []; page.on('pageerror', error => jsErrors.push(error.message));
  for (const route of routes) {
    await page.goto(route); await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, nofollow');
    const phones = page.locator('a[href^="tel:"]');
    expect(await phones.count()).toBeGreaterThan(0);
    for (const phone of await phones.all()) {
      await expect(phone).toHaveAttribute('href','tel:+13035134389');
      await expect(phone).toContainText('303-513-4389');
    }
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.locator('.footer-legal')).toContainText('Red Rocks Technology Group LLC d/b/a Fenrir Commercial Cleaning Service');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const issues = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(issues.violations).toEqual([]);
    const links = await page.locator('a[href^="/"]').evaluateAll(elements => [...new Set(elements.map(element => element.getAttribute('href')!))]);
    for (const link of links) {
      const url = new URL(link, 'http://127.0.0.1:4173'); const response = await request.get(url.href); expect(response.ok(), link).toBe(true);
      if (url.hash) expect(await response.text(), link).toContain(`id="${url.hash.slice(1)}"`);
    }
    await screenshot(page, `${info.project.name}-${route === '/' ? 'home' : route.slice(1)}`);
  }
  expect(jsErrors).toEqual([]);
});
test('primary CTA, FAQ, mobile menu and keyboard focus', async ({ page }, info) => {
  await page.goto('/');
  await page.keyboard.press('Tab'); await expect(page.getByRole('link',{ name:'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.locator('#main')).toBeFocused();
  await page.locator('.hero-actions .button').click(); await expect(page).toHaveURL(/request-walkthrough/);
  const toggle = page.getByRole('button',{name:'Menu'});
  if (info.project.name !== 'desktop') {
    await toggle.click(); await expect(toggle).toHaveAttribute('aria-expanded','true');
    await screenshot(page,`${info.project.name}-menu`);
    await page.keyboard.press('Escape'); await expect(toggle).toHaveAttribute('aria-expanded','false'); await expect(toggle).toBeFocused();
    await toggle.click(); await page.locator('#primary-nav').getByRole('link',{name:'Services', exact:true}).click();
    await expect(page).toHaveURL(/\/#services/); await expect(toggle).toHaveAttribute('aria-expanded','false');
  } else { await page.locator('#primary-nav').getByRole('link',{name:'Services',exact:true}).click(); await expect(page).toHaveURL(/\/#services/); }
  const question = page.locator('summary').filter({ hasText: 'Do you clean after business hours?' }); await question.click();
  await expect(page.locator('details[open]')).toContainText('subject to availability');
});
test('phone fallback works while unconfigured online submission stays disabled', async ({ page }) => {
  await page.goto('/request-walkthrough'); await expect(page.locator('.form-unavailable')).toBeVisible();
  await expect(page.locator('form')).toHaveAttribute('data-enabled','false'); await expect(page.locator('#contactName')).toBeDisabled();
  await expect(page.getByRole('button',{name:'Send Walkthrough Request'})).toHaveCount(0);
  await expect(page.locator('.form-unavailable')).toContainText('Request your walkthrough by phone');
  await expect(page.locator('.form-unavailable a[href="tel:+13035134389"]')).toBeVisible();
  await expect(page.locator('script[src*="cloudflare"]')).toHaveCount(0);
});
test('runtime settings activate a form built without a public key and retain the phone fallback when disabled', async ({ page }) => {
  await page.route(/^http:\/\/127\.0\.0\.1:4173\/request-walkthrough\/?$/, async route => {
    const response = await route.fetch();
    const html = await response.text();
    expect(html).toContain('data-runtime-config="false"');
    await route.fulfill({ response, body: html.replace('data-runtime-config="false"', 'data-runtime-config="true"') });
  });
  let runtimeEnabled = true;
  await page.route('**/api/walkthrough/config', route => route.fulfill({ json: runtimeEnabled ? { enabled: true, siteKey: 'runtime-public-key' } : { enabled: false } }));
  await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js', route => route.fulfill({ contentType: 'text/javascript', body: 'window.turnstile={reset(){}};' }));
  await page.goto('/request-walkthrough');
  await expect(page.locator('form')).toHaveAttribute('data-enabled', 'true');
  await expect(page.locator('form')).toHaveAttribute('action', '/api/walkthrough');
  await expect(page.locator('#contactName')).toBeEnabled();
  await expect(page.locator('.form-unavailable')).toBeHidden();
  await expect(page.locator('.cf-turnstile')).toHaveAttribute('data-sitekey', 'runtime-public-key');
  await expect(page.locator('.turnstile-wrapper')).toBeVisible();
  await page.getByRole('button', { name: 'Send Walkthrough Request' }).click();
  await expect(page.locator('#form-status')).toContainText('Please check');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  runtimeEnabled = false;
  await page.reload();
  await expect(page.locator('form')).toHaveAttribute('data-enabled', 'false');
  await expect(page.locator('#contactName')).toBeDisabled();
  await expect(page.locator('.form-unavailable')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send Walkthrough Request' })).toHaveCount(0);
});
test('form validation, failed receiver preserves data, successful HTTP acceptance', async ({ page, request }, info) => {
  // Deterministic widget substitute only for the isolated QA build and loopback receiver.
  await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js', route => route.fulfill({ contentType:'text/javascript', body: `const widget=document.querySelector('.cf-turnstile');const token=document.createElement('input');token.type='hidden';token.name='cf-turnstile-response';token.value='controlled-token';widget.append(token);window.turnstile={reset:()=>{token.value='controlled-token'}};` }));
  await page.goto('http://127.0.0.1:4180/request-walkthrough');
  await expect(page.locator('a[href="tel:+13035550142"]')).toHaveCount(3);
  await expect(page.locator('a[href="mailto:review@example.test"]').first()).toBeVisible();
  await page.locator('[type=submit]').click(); await expect(page.locator('#form-status')).toContainText('Please check');
  await expect(page.locator('#contactName')).toHaveAttribute('aria-invalid','true'); await expect(page.locator('#form-status')).toBeFocused();
  await page.locator('#contactName').fill('Controlled Test Contact'); await page.locator('#businessName').fill('Reject Test Office'); await page.locator('#town').selectOption('Bailey');
  await page.locator('[type=submit]').click(); await expect(page.locator('#phone-error')).toContainText('phone number or email');
  await page.locator('#email').fill('test@example.test'); await page.locator('#preferredContact').selectOption('Phone');
  await page.locator('[type=submit]').click(); await expect(page.locator('#phone-error')).toContainText('preferred contact');
  await page.locator('#preferredContact').selectOption('Email'); await page.locator('#message').fill('A small office. Weekly cleaning. Synthetic QA data.');
  // Human-scale dwell without a fixed sleep; screenshots and accessibility cover the interval.
  const violations = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze(); expect(violations.violations).toEqual([]);
  await page.locator('[type=submit]').click(); await expect(page.locator('#form-status')).toContainText('couldn’t confirm delivery');
  await expect(page.locator('#businessName')).toHaveValue('Reject Test Office'); await expect(page.locator('#email')).toHaveValue('test@example.test');
  await expect(page.locator('#message')).toHaveValue('A small office. Weekly cleaning. Synthetic QA data.');
  await screenshot(page,`${info.project.name}-form-error`);
  await page.locator('#businessName').fill(`Controlled Test Office ${info.project.name}`); await page.locator('[type=submit]').click();
  await expect(page.locator('#form-status')).toContainText('Your inquiry has been received'); await expect(page.locator('#form-status')).toContainText('An appointment has not been booked');
  await expect(page.locator('#form-fields')).toBeHidden(); await screenshot(page,`${info.project.name}-form-success`);
  const receipts = await (await request.get('http://127.0.0.1:4180/__receipts')).json(); expect(receipts.some((receipt: {payload:{text:string}}) => receipt.payload.text.includes(`Controlled Test Office ${info.project.name}`))).toBe(true);
});
test('narrow phone and enlarged text do not overflow', async ({ page }) => {
  await page.setViewportSize({width:320,height:800});
  for (const width of [320, 1024, 1100, 1280]) {
    await page.setViewportSize({width,height:800});
    for (const route of routes) { await page.goto(route); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}px`).toBe(true); }
  }
  await page.setViewportSize({width:320,height:800});
  await page.goto('/'); await page.addStyleTag({content:'body {font-size: 22.5px}'});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({reducedMotion:'reduce'}); await page.reload();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});
test('mobile navigation works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const page = await context.newPage(); await page.goto('http://127.0.0.1:4173/about');
  await expect(page.locator('#primary-nav').getByRole('link',{name:'Services',exact:true})).toBeVisible();
  await page.locator('#primary-nav').getByRole('link',{name:'Services',exact:true}).click(); await expect(page).toHaveURL(/\/#services/);
  await context.close();
});
