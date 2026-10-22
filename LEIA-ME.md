# Chá Missionário do Elder Borges

Site feito para celular, com três telas:

- `index.html`: início, globo com rotas, contagem regressiva até 18/11, escolha entre Doação e Pix, mapa da missão e mural de recados
- `doacao.html`: lista de itens, com "x pessoas estão levando" ao vivo
- `pix.html`: chave Pix com botão "Copiar chave" e o versículo

Enquanto o Firebase não estiver configurado, o site roda em **modo de teste**: contador e mural funcionam, mas só no aparelho de quem abriu. Para valer para todos os convidados, faça os passos abaixo (leva uns 10 minutos e é gratuito).

## 1. Criar o banco no Firebase

1. Entre em https://console.firebase.google.com com sua conta Google e clique em **Adicionar projeto**. Nome sugerido: `cha-missionario`. Pode desativar o Google Analytics.
2. No menu da esquerda: **Criação > Firestore Database > Criar banco de dados**. Escolha o local `southamerica-east1` (São Paulo) e o modo **produção**.
3. Abra a aba **Regras**, apague o que estiver lá, cole todo o conteúdo do arquivo `firestore.rules` e clique em **Publicar**.
4. Na página inicial do projeto, clique no ícone **</>** (app da Web), dê um apelido (por exemplo `site`) e **não** marque o Firebase Hosting. Vai aparecer um bloco `firebaseConfig = { ... }`.
5. Abra `js/firebase-config.js` e troque cada `COLE_AQUI` pelo valor correspondente desse bloco (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`). Essa chave pode ficar pública: quem protege os dados são as regras do passo 3.

## 2. Colocar no ar (GitHub Pages)

1. Crie um repositório no GitHub e envie todos os arquivos desta pasta.
2. Em **Settings > Pages**, escolha a branch `main`, pasta `/ (root)`, e salve.
3. Em cerca de um minuto o endereço aparece lá (algo como `https://seu-usuario.github.io/nome-do-repositorio/`). É esse link que você manda no WhatsApp.

Também dá para abrir o site direto no computador com um servidor simples (`python3 -m http.server`), mas ele não funciona abrindo o arquivo com duplo clique, porque usa módulos de JavaScript.

## 3. Como testar depois de configurar

1. Abra o link em dois celulares (ou um celular e uma aba anônima).
2. Marque um item em um deles: o número no outro muda sozinho.
3. Publique um recado: ele aparece nos dois.

## Ajustes rápidos

- **Chave Pix, banco e nome**: `pix.html` (texto na tela) e `js/pix.js` (texto que vai para a área de transferência, na linha `var CHAVE`).
- **Data da contagem**: `js/home.js`, constante `INICIO`.
- **Itens da lista**: `js/doacao.js` (lista `ITENS`) e `firestore.rules` (ids permitidos). Para um item novo, ponha a foto em `img/`.
- **Cores**: o começo de `css/style.css`.
- **Apagar um recado indevido**: Firebase Console > Firestore Database > coleção `recados` > excluir o documento.
- **Zerar um contador**: Firebase Console > Firestore Database > coleção `itens` > editar o campo `count`.
