import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const exists = p => existsSync(new URL('public/' + p.replace(/^\//, '').split('?')[0], root));
const html = read('public/index.html');

test('arquivos locais citados na página existem', () => {
  const refs = [...html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)].map(m => m[1]).filter(r => r !== '/');
  assert.ok(refs.length > 5);
  for (const r of refs) assert.ok(exists(r), r);
});

test('elementos fixos usados pelo app.js existem na página', () => {
  const js = read('public/js/app.js');
  const dynamic = /^(w-|o-(?!h$)|custom$)/;
  const ids = new Set([...js.matchAll(/\$\('([a-z-]+)'/g)].map(m => m[1]));
  assert.ok(ids.size > 10);
  for (const id of ids) {
    if (dynamic.test(id)) continue;
    assert.ok(html.includes(`id="${id}"`), id);
  }
});

test('service worker pré-carrega só arquivos que existem', () => {
  const sw = read('public/sw.js');
  const list = /PRECACHE = \[([\s\S]*?)\]/.exec(sw)[1];
  const files = [...list.matchAll(/'([^']+)'/g)].map(m => m[1]).filter(f => f !== '/');
  assert.ok(files.length > 3);
  for (const f of files) assert.ok(exists(f), f);
});

test('manifesto é válido e os ícones existem', () => {
  const m = JSON.parse(read('public/manifest.webmanifest'));
  assert.equal(m.start_url, '/');
  assert.ok(m.icons.some(i => i.purpose === 'maskable'));
  for (const i of m.icons) assert.ok(exists(i.src), i.src);
});

test('dados estruturados são JSON válido', () => {
  const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)[1];
  assert.equal(JSON.parse(ld)['@type'], 'WebApplication');
});

test('página não tem script inline executável, o que mantém a CSP rígida', () => {
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)].filter(m => !/application\/ld\+json/.test(m[1]));
  assert.equal(inline.length, 0);
  assert.doesNotMatch(html, /\son[a-z]+="/i, 'atributo de evento inline');
});

test('firebase.json é válido e tem cabeçalhos de segurança', () => {
  const f = JSON.parse(read('firebase.json'));
  const keys = f.hosting.headers.find(h => h.source === '**').headers.map(h => h.key);
  for (const k of ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy']) assert.ok(keys.includes(k), k);
  assert.ok(f.hosting.headers.some(h => h.source === '/sw.js'));
});

test('marcadores de publicação aparecem onde a automação espera', () => {
  for (const f of ['public/index.html', 'public/robots.txt', 'public/sitemap.xml']) assert.match(read(f), /__DOMINIO__/, f);
  for (const f of ['public/index.html', 'public/sw.js']) assert.match(read(f), /__VERSAO__/, f);
});
