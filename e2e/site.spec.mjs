import { test, expect } from '@playwright/test';

const tokens = page => page.locator('#tokens .tk');
const tokenNames = page => page.locator('#tokens .tag').evaluateAll(els => els.map(e => e.firstChild.textContent));

let pageErrors;
test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));
});
test.afterEach(() => expect(pageErrors, 'erros de JavaScript na página').toEqual([]));

test('carrega o XI padrão sem erros', async ({ page }) => {
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/');
  await expect(tokens(page)).toHaveCount(11);
  await expect(page.locator('#xi-sum')).toHaveText('7.858');
  await expect(page.locator('#card h2')).toHaveText('Messi');
  await expect(page.locator('#rank > li')).toHaveCount(20);
  expect(errors).toEqual([]);
});

test('não tem rolagem horizontal', async ({ page }) => {
  await page.goto('/');
  await expect(tokens(page)).toHaveCount(11);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('tocar num jogador mostra a conta dele', async ({ page }) => {
  await page.goto('/');
  await tokens(page).filter({ hasText: 'Casillas' }).click();
  await expect(page.locator('#card h2')).toHaveText('Casillas');
  await expect(tokens(page).filter({ hasText: 'Casillas' })).toHaveAttribute('aria-pressed', 'true');
});

test('formação e pesos prontos mudam o time e o endereço', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '4-4-2' }).click();
  await expect(page).toHaveURL(/#442_/);
  await page.getByRole('button', { name: 'Copa é rei' }).click();
  await expect(page.getByRole('button', { name: 'Copa é rei' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/#442_200-40-30-8-60-20-10-40-60-10_60-1-1$/);
  expect(await tokenNames(page)).toContain('Torres');
});

test('link compartilhado abre o mesmo time com o painel de pesos aberto', async ({ page }) => {
  await page.goto('/#4231_100-50-35-15-80-30-15-50-30-15_30-1-0');
  await expect(page.getByRole('button', { name: '4-2-3-1' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#weights')).toBeVisible();
  await expect(page.locator('#o-h')).toHaveText('30%');
  await expect(page.locator('#custom')).toBeVisible();
});

test('slider de peso recalcula a soma', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ajustar' }).click();
  const before = await page.locator('#xi-sum').textContent();
  await page.locator('#w-wc').fill('200');
  await expect(page.locator('#xi-sum')).not.toHaveText(before);
  await expect(page.locator('#o-wc')).toHaveText('200');
  await page.getByRole('button', { name: 'Voltar ao padrão' }).click();
  await expect(page.locator('#xi-sum')).toHaveText('7.858');
});

test('busca ignora acentos e filtro por posição conta jogadores', async ({ page }) => {
  await page.goto('/');
  await page.locator('#q').fill('modric');
  await expect(page.locator('#rank .rk')).toHaveCount(1);
  await expect(page.locator('#rank .rname')).toContainText('Modrić');
  await page.locator('#q').fill('');
  await page.locator('#filters [data-filt="GOL"]').click();
  await expect(page.locator('#count')).toHaveText('12 jogadores');
});

test('trocar jogador pelo painel, compartilhar a escolha e desfazer', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-pick]').click();
  const dialog = page.getByRole('dialog', { name: 'Escolher ponta-direita' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[aria-current="true"]')).toContainText('Messi');
  await dialog.locator('[data-choose]').filter({ hasText: 'Lamine Yamal' }).click();
  await expect(dialog).toBeHidden();

  await expect(page.locator('#card h2')).toHaveText('Lamine Yamal');
  await expect(page.locator('.lock-info')).toContainText('Pela conta, a vaga seria de Messi');
  await expect(page.locator('#tokens .tk.locked')).toHaveCount(1);
  await expect(page).toHaveURL(/_2\.lamineyamal$/);
  expect(await tokenNames(page)).toContain('Messi');

  await page.reload();
  await expect(page.locator('#tokens .tk.locked')).toContainText('Yamal');
  await expect(page.locator('#locks-note')).toBeVisible();

  await page.getByRole('button', { name: 'Voltar ao XI calculado' }).click();
  await expect(page.locator('#tokens .tk.locked')).toHaveCount(0);
  await expect(page).not.toHaveURL(/#/);
});

test('painel de troca fecha com Esc', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-pick]').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('painel de troca não fecha com clique na borda interna, só no fundo', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-pick]').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  await page.mouse.click(box.x + 6, box.y + box.height / 2);
  await expect(dialog).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog).toBeHidden();
});

test('gera a imagem do time', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium');
  await page.goto('/');
  await expect(tokens(page)).toHaveCount(11);
  await page.evaluate(() => { navigator.canShare = () => false; });
  const download = page.waitForEvent('download');
  await page.locator('#image').click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('xi-do-seculo-4-3-3.png');
});

test('endereço inexistente mostra a página 404', async ({ page }) => {
  const res = await page.goto('/nao-existe');
  expect(res.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Impedido' })).toBeVisible();
});

test('atalho / leva à busca', async ({ page, isMobile }) => {
  test.skip(isMobile);
  await page.goto('/');
  await expect(tokens(page)).toHaveCount(11);
  await page.keyboard.press('/');
  await expect(page.locator('#q')).toBeFocused();
});

for (const colorScheme of ['light', 'dark']) test(`acessibilidade (${colorScheme}): página e painel de troca sem violações WCAG A/AA`, async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
  await page.emulateMedia({ colorScheme });
  await page.goto('/');
  await expect(tokens(page)).toHaveCount(11);
  const pageScan = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(pageScan.violations.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([]);

  await page.locator('[data-pick]').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const dialogScan = await new AxeBuilder({ page }).include('#picker').withTags(tags).analyze();
  expect(dialogScan.violations.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});
