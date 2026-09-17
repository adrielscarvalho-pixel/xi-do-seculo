// Preenche os marcadores antes de publicar. Funciona em Linux, macOS e Windows.
//   DOMINIO=meusite.web.app node scripts/prepare-deploy.mjs
// __DOMINIO__ vira o endereço do site (prévia de link, canonical, sitemap).
// __VERSAO__ vira o commit atual, o que renova o cache do app instalado.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const dominio = (process.env.DOMINIO || '').replace(/^https?:\/\//, '').replace(/\/+$/, '');
if (!dominio) {
  console.error('Defina DOMINIO, por exemplo: DOMINIO=meu-projeto.web.app');
  process.exit(1);
}

let versao = process.env.VERSAO;
if (!versao) {
  try { versao = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { versao = Date.now().toString(36); }
}

const files = ['public/index.html', 'public/sw.js', 'public/robots.txt', 'public/sitemap.xml'];
let total = 0;
for (const f of files) {
  const before = readFileSync(f, 'utf8');
  const after = before.replaceAll('__DOMINIO__', dominio).replaceAll('__VERSAO__', versao);
  const n = (before.match(/__DOMINIO__|__VERSAO__/g) || []).length;
  total += n;
  if (n) writeFileSync(f, after);
  console.log(`${f}: ${n} marcadores`);
}
if (!total) {
  console.error('Nenhum marcador encontrado. Os arquivos já foram preenchidos?');
  process.exit(1);
}
console.log(`Pronto para publicar em https://${dominio} (versão ${versao})`);
