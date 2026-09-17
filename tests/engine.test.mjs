import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const E = require('../public/js/engine.js');
const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');

const FORMATIONS = Object.keys(E.FM);

test('dados: cada liga tem uma temporada por ano, de 2001 a 2026', () => {
  for (const k of E.LGK) {
    const d = E.DATA.S[k];
    assert.equal(d.c.split(' ').length, 26, `${k} campeões`);
    assert.equal(d.s.split(' ').length, 26, `${k} coeficientes`);
    assert.equal(d.p.length, 26, `${k} hegemonia`);
    assert.match(d.p, /^[0-5]+$/, `${k} hegemonia entre 0 e 5`);
    for (const c of d.c.split(' ')) {
      if (c === '---') continue;
      assert.ok(E.CLUB[c], `${k}: clube ${c} sem nome`);
    }
  }
});

test('dados: hegemonia confere com os campeões dos cinco anos anteriores', () => {
  for (const k of E.LGK) {
    const champs = E.DATA.S[k].c.split(' ');
    const heg = E.DATA.S[k].p;
    champs.forEach((c, i) => {
      if (i < 5 || c === '---') return;
      const wins = champs.slice(i - 5, i).filter(x => x === c).length;
      assert.equal(+heg[i], wins, `${k} ${2001 + i} (${c})`);
    });
  }
});

test('dados: jogadores têm campos válidos', () => {
  const names = new Set();
  for (const p of E.PLAYERS) {
    assert.ok(!names.has(p.n), `nome repetido: ${p.n}`);
    names.add(p.n);
    assert.ok(E.POS[p.pos], `${p.n}: posição ${p.pos}`);
    p.sec.forEach(s => assert.ok(E.POS[s] && s !== p.pos, `${p.n}: posição secundária ${s}`));
    assert.ok(E.NAT[p.nat], `${p.n}: seleção ${p.nat}`);
    for (const k of ['wc', 'ucl']) {
      for (const t of p[k]) {
        assert.ok(t.y >= 2001 && t.y <= 2026, `${p.n}: ano ${t.y}`);
        assert.ok(E.PHI[t.r] !== undefined, `${p.n}: papel ${t.r}`);
      }
    }
    for (const k of ['cont', 'b1', 'b2', 'b3', 'fifa', 'gb', 'xi']) {
      assert.ok(Number.isInteger(p[k]) && p[k] >= 0, `${p.n}: ${k}`);
    }
  }
});

test('dados: passagens por clube usam clubes conhecidos e anos em ordem', () => {
  for (const a of E.DATA.P) {
    if (!a[13]) continue;
    for (const t of a[13].split(',')) {
      const m = /^(\w+):(\d\d)-(\d\d)$/.exec(t);
      assert.ok(m, `${a[0]}: passagem malformada "${t}"`);
      assert.ok(E.CLUB[m[1]], `${a[0]}: clube ${m[1]} sem nome`);
      assert.ok(+m[2] <= +m[3], `${a[0]}: anos invertidos em ${t}`);
    }
  }
});

test('dados: cada Copa do Mundo tem campeões de uma única seleção', () => {
  const wc = {};
  for (const p of E.PLAYERS) for (const t of p.wc) (wc[t.y] ||= new Set()).add(p.nat);
  for (const [y, nats] of Object.entries(wc)) assert.equal(nats.size, 1, `Copa ${y} com seleções diferentes: ${[...nats]}`);
  const b1 = E.PLAYERS.reduce((a, p) => a + p.b1, 0);
  assert.ok(b1 <= 25, `mais Bolas de Ouro do que edições: ${b1}`);
});

test('cálculo: todo peso pronto monta 11 jogadores diferentes em toda formação', () => {
  for (const [name, pre] of Object.entries(E.PRE)) {
    for (const F of FORMATIONS) {
      const r = E.compute(pre.w, pre.x, F);
      assert.equal(r.xi.length, 11, `${name} ${F}`);
      assert.equal(new Set(r.xi.map(s => s.p.id)).size, 11, `${name} ${F} repetido`);
      r.xi.forEach(s => assert.ok(s.p.pos === s.pos || s.p.sec.includes(s.pos), `${s.p.n} fora de posição`));
      assert.ok(r.inXI.has(r.best));
    }
  }
});

test('cálculo: não altera os jogadores de base entre chamadas', () => {
  const a = E.compute(E.DEF, E.DX, '4-3-3').ranked.map(p => p.t);
  E.compute(E.PRE['Só individual'].w, E.PRE['Só individual'].x, '4-4-2');
  const b = E.compute(E.DEF, E.DX, '4-3-3').ranked.map(p => p.t);
  assert.deepEqual(a, b);
  assert.equal(E.PLAYERS[0].t, undefined);
});

test('cálculo: ranking em ordem e empates dividem a posição', () => {
  const r = E.compute(E.PRE['Só coletivo'].w, E.PRE['Só coletivo'].x, '4-3-3');
  r.ranked.forEach((p, i) => {
    if (i === 0) return assert.equal(p.r, 1);
    const prev = r.ranked[i - 1];
    assert.ok(prev.t >= p.t);
    assert.equal(p.r, Math.abs(prev.t - p.t) < 1e-9 ? prev.r : i + 1);
  });
});

test('metodologia: exemplos do texto batem com a conta', () => {
  const html = read('public/index.html');
  const bayern = E.leagueTitleValue('BL', 2019, E.DEF, E.DX);
  assert.equal(bayern.club, 'Bayern');
  assert.equal(Math.round(bayern.v * 10) / 10, 4.2);
  assert.match(html, /Bayern de 2018\/19, pentacampeão seguido, vale 4,2 pontos/);
  const arsenal = E.leagueTitleValue('PL', 2026, E.DEF, E.DX);
  assert.equal(arsenal.club, 'Arsenal');
  assert.equal(Math.round(arsenal.v * 10) / 10, 15);
  assert.match(html, /Arsenal de 2025\/26.*vale 15/);
  assert.match(html, new RegExp(`desconto de ${Math.round((1 - E.ADAPT) * 100)}% na comparação`));
  assert.match(html, new RegExp(`desconto padrão de ${E.DX.h}%`));
});

test('metodologia: tabela de pontos da página é a mesma do padrão', () => {
  const html = read('public/index.html');
  const rows = [...html.matchAll(/<tr><td>([^<]+)<\/td><td>(?:até )?(\d+)<\/td><\/tr>/g)].map(m => [m[1], +m[2]]);
  const map = {
    'Copa do Mundo': 'wc', 'Bola de Ouro': 'b1', 'Champions League': 'ucl', 'Melhor do mundo FIFA': 'fifa',
    'Eurocopa ou Copa América': 'cont', 'Bola de Ouro, 2º lugar': 'b2', 'Bola de Ouro da Copa': 'gb',
    'Bola de Ouro, 3º lugar': 'b3', 'Seleção do ano FIFPRO/FIFA': 'xi', 'Liga top-5, por título': 'lg'
  };
  assert.equal(rows.length, E.K.length);
  for (const [label, v] of rows) assert.equal(v, E.DEF[map[label]], label);
});

test('protagonismo: participações reduzidas são exatamente as citadas no texto', () => {
  const html = read('public/index.html');
  const cited = [['Kaká', 'wc', 2002], ['Nesta', 'wc', 2006], ['Dembélé', 'wc', 2018], ['Messi', 'ucl', 2006], ['Xavi', 'ucl', 2006],
    ['Piqué', 'ucl', 2008], ['Casemiro', 'ucl', 2014], ['Xavi', 'ucl', 2015], ['Bale', 'ucl', 2017], ['Bale', 'ucl', 2022],
    ['Hakimi', 'ucl', 2018], ['Marcelo', 'ucl', 2022], ['Hazard', 'ucl', 2022], ['Modrić', 'ucl', 2024], ['Alaba', 'ucl', 2024], ['Courtois', 'ucl', 2024]];
  for (const [n, k, y] of cited) {
    const p = E.PLAYERS.find(x => x.n === n);
    const t = p[k].find(x => x.y === y);
    assert.ok(t && t.r !== 'T', `${n} ${y}`);
  }
  const reduced = E.PLAYERS.flatMap(p => [...p.wc, ...p.ucl].filter(t => t.r !== 'T').map(() => p.n));
  assert.equal(reduced.length, cited.length, 'há participação reduzida não citada no texto');
  assert.match(html, /Kaká em 2002/);
});

test('imagem de prévia: time e pontos de make_assets.py são os do padrão', () => {
  const py = read('make_assets.py');
  const listed = [...py.matchAll(/\('([^']+)', (\d+), \d+, \d+, (?:True|False)\)/g)].map(m => [m[1], +m[2]]);
  assert.equal(listed.length, 11);
  const r = E.compute(E.DEF, E.DX, '4-3-3');
  const pts = Object.fromEntries(r.xi.map(s => [s.p.n, Math.round(s.p.t)]));
  const alias = { 'C. Ronaldo': 'Cristiano Ronaldo' };
  for (const [name, v] of listed) assert.equal(pts[alias[name] || name], v, name);
  assert.match(py, new RegExp(`${E.PLAYERS.length} jogadores avaliados`));
});

test('endereço: estado padrão não gera hash', () => {
  assert.equal(E.encodeState({ F: '4-3-3', W: { ...E.DEF }, X: { ...E.DX } }), '');
});

test('endereço: ida e volta preserva formação e pesos', () => {
  for (const pre of Object.values(E.PRE)) {
    for (const F of FORMATIONS) {
      const st = { F, W: { ...pre.w }, X: { ...pre.x } };
      const back = E.decodeState('#' + E.encodeState(st));
      assert.deepEqual(back, st);
    }
  }
});

test('endereço: valores inválidos voltam ao padrão sem quebrar', () => {
  const bads = ['', '#', '#xyz', '#433_1-2-3', '#433_999-0-0-0-0-0-0-0-0-0', '#433_a-b', '#%E0%A4%A',
    '#433__55-1-1', '#999_' + E.K.map(() => 5).join('-')];
  for (const bad of bads) {
    const st = E.decodeState(bad);
    assert.ok(E.FM[st.F], bad);
    if (bad !== '#999_' + E.K.map(() => 5).join('-')) assert.deepEqual(st.W, E.DEF, bad);
    assert.equal(st.X.h % 10, 0, bad);
  }
});

test('texto de compartilhamento lista os 11 jogadores', () => {
  const r = E.compute(E.DEF, E.DX, '4-2-3-1');
  const text = E.lineupText(r.xi, '4-2-3-1');
  for (const s of r.xi) assert.ok(text.includes(s.p.n), s.p.n);
});
