# O XI do século

Site que calcula o melhor time do século 21 a partir de títulos e prêmios entre 2001 e 2026.
Cada conquista vale pontos conforme a relevância, com ajustes para a força da liga,
a hegemonia do clube e o protagonismo do jogador na campanha.

O site é estático, sem servidor e sem banco. Funciona offline depois da primeira visita,
pode ser instalado como app pelo celular e se adapta ao modo escuro do sistema.

## O que o site faz

- Monta o XI em 4-3-3, 4-2-3-1 ou 4-4-2, com jogadores adaptados quando superam a posição.
- Deixa ajustar o peso de cada título e prêmio, com seis combinações prontas.
- Guarda a escalação e os pesos no endereço, então o link compartilhado abre o mesmo time.
- Gera uma imagem 1080×1350 do time para Instagram, WhatsApp e stories.
- Mostra o ranking dos 97 jogadores com a conta detalhada de cada um.

## Estrutura

```
public/                 o site pronto (é isso que vai para o ar)
  index.html            página, estilos e metodologia
  js/engine.js          dados e cálculo, sem acesso à tela (testável no Node)
  js/app.js             interface: campo, ranking, pesos, compartilhar, imagem
  sw.js                 cache para funcionar offline
  404.html              página de erro
  robots.txt, sitemap.xml
  manifest.webmanifest, og.png, icon-*
tests/                  testes de dados, cálculo e estrutura do site
scripts/prepare-deploy.mjs  preenche endereço e versão antes de publicar
make_assets.py          regera ícones e a imagem de prévia (opcional)
firebase.json           hospedagem, cache e cabeçalhos de segurança
```

## Rodar no computador

Precisa de Node 22 ou mais novo.

```bash
npm run dev
```

Abre em http://localhost:8080. O modo offline só liga em HTTPS, então não aparece localmente.

## Testes

```bash
npm test
```

Os testes conferem:

- **Dados.** Cada liga tem 26 temporadas e a hegemonia bate com os campeões anteriores. Clubes, posições e seleções existem.
- **Cálculo.** Todos os pesos prontos montam 11 jogadores diferentes em todas as formações, e o ranking trata empates.
- **Metodologia.** Os exemplos do texto, como o Bayern 2018/19 valendo 4,2 pontos, batem com a conta de verdade.
- **Imagem de prévia.** Os pontos desenhados em `og.png` são os do time padrão. Se mudar os dados, o teste avisa para regerar a imagem.
- **Site.** Arquivos citados existem, não há script inline e os cabeçalhos de segurança estão configurados.

## Publicar

A cada `push` na branch `main`, o GitHub Actions roda os testes e publica se passarem.
Cada pull request ganha uma prévia própria no Firebase, válida por 7 dias.

Antes do primeiro envio, cadastre dois segredos em
Settings → Secrets and variables → Actions:

- `FIREBASE_PROJECT_ID`: o ID do projeto no Firebase
- `FIREBASE_SERVICE_ACCOUNT`: o JSON inteiro da conta de serviço

O endereço entra sozinho como `SEU-PROJETO.web.app`. Para usar domínio próprio,
crie a variável `DOMINIO` em Settings → Secrets and variables → Actions → Variables.
Isso importa para a prévia de link do WhatsApp e para o Google.

Para publicar do computador, sem GitHub Actions:

```bash
npm install -g firebase-tools
firebase login
firebase use SEU-PROJETO-FIREBASE
DOMINIO=SEU-PROJETO.web.app npm run prepare-deploy
npm run deploy
git checkout public
```

O último comando devolve os marcadores `__DOMINIO__` e `__VERSAO__` aos arquivos.

## Atualizar os dados

Os dados ficam no começo de `public/js/engine.js`, com o formato de cada campo explicado no comentário.
Depois de editar:

1. Rode `npm test`.
2. Se o time padrão mudou, atualize os nomes e pontos em `make_assets.py` e regere as imagens.
3. Atualize a data em "Dados atualizados em" no rodapé, no `sitemap.xml` e no `dateModified` do `index.html`.

## Regerar as imagens

```bash
pip install pillow
python make_assets.py public
```

## Fontes dos dados

FIFPRO (seleções World 11), FIFA (The Best e prêmios da Copa), UEFA (Champions League
e coeficientes por país), France Football (Bola de Ouro) e os registros oficiais das ligas.
A metodologia completa está no fim da própria página.
