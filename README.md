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

## 📦 Como fazer o Deploy no Easypanel

A aplicação já possui um `Dockerfile` configurado para compilar tanto o Backend quanto o Frontend e rodar os dois de forma eficiente. Siga os passos abaixo para fazer o deploy no **Easypanel**:

### Passo 1: Criar o Banco de Dados
1. Acesse o seu projeto no Easypanel.
2. Crie um novo serviço do tipo **PostgreSQL**.
3. Após criar, vá na aba de conexão do serviço e copie a URL do banco (algo como `postgresql://postgres:senha@nome-do-banco:5432/postgres`).

### Passo 2: Criar a Aplicação
1. No Easypanel, crie um novo serviço do tipo **App** (ou aponte diretamente como GitHub, caso tenha integrado o Easypanel com sua conta).
2. Se usar a integração do GitHub, conecte este repositório (`GuilhermeAzespo/Azespo-ChatHub`). Se usar manual, aponte a fonte para a imagem Docker deste repositório.

### Passo 3: Configurar Variáveis de Ambiente (Environment)
Dentro da aba **Environment** da sua nova App, adicione as seguintes variáveis:

```env
DATABASE_URL="coloque-a-url-do-postgres-copiada-aqui"
PORT="3000"
```

### Passo 4: Configurar Volumes Persistentes (Extremamente Importante)
A biblioteca do WhatsApp armazena os "tokens de sessão" dos celulares conectados. Se você não configurar um volume, toda vez que fizer um novo deploy ou a aplicação reiniciar, todos os números serão desconectados.

1. Vá na aba **Storage/Volumes** da sua App no Easypanel.
2. Crie um **Volume Mount** (Mount path) apontando para a pasta: `/app/sessions`
3. Dessa forma, as conexões ficam salvas de forma persistente.

### Passo 5: Fazer o Deploy
1. Clique no botão **Deploy**! 
2. O servidor cuidará de compilar o Node e o React e subir o sistema. O nosso Dockerfile também está configurado para executar `npx prisma db push` automaticamente, ou seja, suas tabelas no banco de dados serão criadas sozinhas na primeira execução.
3. Configure o **Domain** dentro do Easypanel para acessar o painel pelo seu navegador (ex: `chathub.azespo.com.br`).

---

## 📚 Endpoints Básicos da API

Para integrar com seus sistemas, após criar uma "Global API Key" no painel, envie as requisições sempre com o Header: `Authorization: Bearer SUA_API_KEY_AQUI`. *(Obs: Implemente esse middleware no backend depois de ajustar suas chaves!)*

- **Criar Instância:** `POST /api/instance/create` 
  - *Body:* `{ "instanceName": "NomeDaSessao" }`
- **Pegar Status:** `GET /api/instance/connectionState/:instanceName`
- **Enviar Mensagem:** `POST /api/message/sendText/:instanceName`
  - *Body:* `{ "number": "5511999999999", "text": "Olá mundo!" }`