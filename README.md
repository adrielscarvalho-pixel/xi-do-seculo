# O XI do século

Site que calcula o melhor time do século 21 a partir de títulos e prêmios entre 2001 e 2026.
Cada conquista vale pontos conforme a relevância, com ajustes para a força da liga,
a hegemonia do clube e o protagonismo do jogador na campanha.

O site é estático: um único `index.html` com todos os dados embutidos, sem servidor e sem banco.
Funciona offline depois da primeira visita e pode ser instalado como app pelo celular.

## Estrutura

```
public/          o site pronto (é isso que vai para o ar)
  index.html     página única, dados e cálculo embutidos
  sw.js          cache para funcionar offline
  manifest.webmanifest
  og.png         imagem de prévia para WhatsApp e redes
  icon-*.png     ícones do app
make_assets.py   regera ícones e a imagem de prévia (opcional)
firebase.json    configuração do Firebase Hosting
```

## Publicar

A cada `push` na branch `main`, o GitHub Actions publica sozinho.
Antes do primeiro envio, cadastre dois segredos em
Settings → Secrets and variables → Actions:

- `FIREBASE_PROJECT_ID`: o ID do projeto no Firebase
- `FIREBASE_SERVICE_ACCOUNT`: o JSON inteiro da conta de serviço

O endereco final entra sozinho: a automacao troca o marcador `__DOMINIO__`
por `SEU-PROJETO.web.app` antes de publicar. Se voce usar dominio proprio,
crie a variavel `DOMINIO` em Settings -> Secrets and variables -> Actions -> Variables.
Isso importa para a previa de link do WhatsApp funcionar.

Para publicar do computador, sem GitHub Actions:

```
npm install -g firebase-tools
firebase login
firebase use SEU-PROJETO-FIREBASE
sed -i "s|__DOMINIO__|SEU-PROJETO.web.app|g" public/index.html
firebase deploy --only hosting
```

## Regerar as imagens

```
pip install pillow
python3 make_assets.py public
```

## Fontes dos dados

FIFPRO (seleções World 11), FIFA (The Best e prêmios da Copa), UEFA (Champions League
e coeficientes por país), France Football (Bola de Ouro) e os registros oficiais das ligas.
A metodologia completa está no fim da própria página.
