# Azespo-ChatHub 🚀

**Azespo-ChatHub** é um hub centralizado, escalável e de alta performance para a integração e gerenciamento de múltiplas instâncias de WhatsApp, construído com Node.js, Express e a biblioteca `@whiskeysockets/baileys`. 

Idealizado para substituir dependências de ferramentas externas (como a Evolution API), este sistema entrega total controle da sua mensageria. Ele conta com uma API robusta, um sistema de disparos de **Webhooks** em tempo real e um **Painel de Controle** (Frontend) moderno construído com Vite, React e Tailwind CSS para gerenciar facilmente suas instâncias e API Keys globais.

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js, Express, TypeScript, `@whiskeysockets/baileys` (Multi-Device WhatsApp SDK).
- **Banco de Dados:** PostgreSQL (via Prisma ORM).
- **Frontend:** React, Vite, Tailwind CSS, Lucide React.
- **Infraestrutura:** Multi-stage Dockerfile otimizado para deploy em plataformas como o **Easypanel**.

---

## 📦 Guia Definitivo: Como fazer o Deploy no Easypanel (Passo a Passo)

Este guia foi feito para "pegar na sua mão". Siga cada clique com atenção para colocar o Azespo-ChatHub no ar!

### Passo 1: Criando o Banco de Dados (PostgreSQL)
A primeira coisa que precisamos é de um lugar seguro para salvar nossas configurações (como o nome das instâncias e as chaves de API). 

1. Abra o painel do seu **Easypanel** no navegador e acesse o seu **Project** (Projeto).
2. Clique no botão azul **"New Service"** (Novo Serviço) no canto superior direito.
3. Vai abrir uma tela com várias opções de aplicativos. Role a página até a seção de *Databases* e clique em **PostgreSQL**.
4. No campo **"Service Name"**, digite um nome fácil, como `chathub-db`. O Password (Senha) já virá preenchido com algo aleatório e seguro, você não precisa mexer.
5. Clique no botão azul **"Create"**.
6. Aguarde alguns segundos. O serviço será criado e a tela dele vai abrir.
7. Na página do banco que acabou de abrir, procure pelo campo chamado **"Connection URL"** (ou URL de Conexão). 
8. Copie essa URL inteira! Ela começa com `postgresql://`. Cole-a num bloco de notas, pois vamos precisar dela logo mais.

### Passo 2: Criando a Aplicação do ChatHub
Agora vamos puxar o nosso código do GitHub para dentro do Easypanel.

1. Volte para a página principal do seu **Project** no Easypanel.
2. Clique novamente em **"New Service"** (Novo Serviço).
3. Na primeira fileira do topo, clique na opção **"App"** (ou "GitHub", se o seu Easypanel for mais antigo).
4. No campo **"Service Name"**, digite `azespo-chathub`.
5. Clique em **"Create"**.
6. O Easypanel abrirá a aba **"Source"** (Fonte) da sua nova aplicação. 
7. Encontre a seção **"Github"** (ou Git).
8. No campo de repositório, digite exatamente isso: `GuilhermeAzespo/Azespo-ChatHub`. No campo branch, digite `main`.
9. **Importante:** Se o seu repositório for privado, não esqueça de colocar um Token de acesso ou vincular sua conta do GitHub nas configurações do Easypanel.
10. Clique no botão **"Save"** (Salvar) na aba Source.

### Passo 3: Configurando o Banco na Aplicação (Variáveis de Ambiente)
O nosso sistema precisa saber com qual banco de dados ele vai conversar. Vamos contar isso para ele.

1. Na mesma tela da aplicação `azespo-chathub`, olhe o menu no topo e clique na aba **"Environment"** (Ambiente).
2. Você verá uma caixa de texto preta (editor de código). Apague tudo o que tiver nela e cole as duas linhas abaixo:
   ```env
   DATABASE_URL="coloque-aqui-a-url-do-banco-que-voce-copiou-no-bloco-de-notas"
   PORT="3000"
   ```
3. Substitua o texto entre aspas do `DATABASE_URL` pela URL real que você copiou no Passo 1. Vai ficar algo como: `DATABASE_URL="postgresql://postgres:suasenha@chathub-db:5432/postgres"`
4. Clique no botão azul **"Save"** no final da tela.

### Passo 4: O Segredo de Ouro (Volumes Persistentes)
**PRESTE MUITA ATENÇÃO AQUI!** Se você pular este passo, todos os seus WhatsApps vão desconectar sozinhos toda vez que o Easypanel reiniciar! Isso acontece porque a biblioteca de mensagens salva os "tokens" do celular em uma pastinha, e o Docker apaga pastas quando reinicia.

1. No menu superior da aplicação `azespo-chathub`, clique na aba **"Storage"** ou **"Volumes"**.
2. Na seção chamada **"Mounts"** ou **"Volume Mounts"**, clique no botão para adicionar um novo volume.
3. Vai aparecer um campo chamado **"Mount Path"** (Caminho da Montagem). Digite EXATAMENTE isso: `/app/sessions`
4. O campo "Volume Name" (Nome do volume) pode deixar o que ele gerar sozinho (ou digite `chathub-sessions`).
5. Clique em **"Save"**. Pronto! O Easypanel agora sabe que a pasta `/app/sessions` nunca deve ser apagada.

### Passo 5: Configurando o Domínio (URL)
Vamos dar um link bonitinho para você acessar o painel.

1. No menu superior da aplicação, clique na aba **"Domains"** (Domínios).
2. No campo **Host**, digite o endereço que você deseja. Exemplo: `chathub.azespo.com.br`
3. No campo **Port** (Porta Externa/Interna), digite `3000` (que é a porta que nosso painel usa).
4. Deixe marcada a opção de gerar certificado SSL (HTTPS) automático.
5. Clique em **"Add Domain"**.
*(Lembre-se de ir no site onde você comprou o domínio, como a Hostinger, e criar um apontamento DNS tipo 'A' ou 'CNAME' apontando o `chathub` para o IP do servidor do Easypanel).*

### Passo 6: Lançar o Foguete! (Fazer o Deploy)
Tudo configurado! Vamos colocar no ar.

1. No canto superior direito da tela do Easypanel, vai ter um botão enorme escrito **"Deploy"**. Clique nele!
2. O Easypanel vai começar a baixar o nosso código do GitHub, instalar o Node.js, e fazer tudo que configuramos no nosso `Dockerfile`.
3. Isso vai demorar alguns bons minutos na primeira vez. Você pode clicar em **"Deployments"** ou **"Logs"** para ver a mágica acontecendo como um "hacker" vendo textos passando na tela.
4. Quando ficar verdinho e disser "Success", pronto! O sistema já rodou o comando automático (`npx prisma db push`) para criar as tabelas no PostgreSQL.
5. Acesse a URL que você configurou (ex: `https://chathub.azespo.com.br`) e aproveite o seu novo sistema Azespo-ChatHub!

---

## 📚 Endpoints Básicos da API

Para integrar com seus sistemas, após criar uma "Global API Key" no painel, envie as requisições sempre com o Header: `Authorization: Bearer SUA_API_KEY_AQUI`. *(Obs: Implemente esse middleware no backend depois de ajustar suas chaves!)*

- **Criar Instância:** `POST /api/instance/create` 
  - *Body:* `{ "instanceName": "NomeDaSessao" }`
- **Pegar Status:** `GET /api/instance/connectionState/:instanceName`
- **Enviar Mensagem:** `POST /api/message/sendText/:instanceName`
  - *Body:* `{ "number": "5511999999999", "text": "Olá mundo!" }`