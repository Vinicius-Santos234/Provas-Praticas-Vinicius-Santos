📦 Sistema de Cadastro de Produtos com Firebase

Este projeto é uma aplicação web desenvolvida em React que permite o cadastro e listagem de produtos utilizando o Firebase Authentication e o Cloud Firestore.

O sistema realiza autenticação de usuários e salva os produtos individualmente para cada usuário logado.

🚀 Funcionalidades
🔐 Autenticação de usuários (login)
➕ Cadastro de produtos
📋 Listagem de produtos em tempo real
🗂️ Organização dos dados por usuário
🔄 Atualização automática com Firestore (onSnapshot)
🛠️ Tecnologias utilizadas
⚛️ React
🔥 Firebase
Authentication
Cloud Firestore
💻 JavaScript (ES6+)
🎨 HTML + CSS
📁 Estrutura do banco (Firestore)

Os dados são organizados da seguinte forma:

users (collection)
  └── userId (document)
        └── produtos (collection)
              └── produtoId (document)
⚙️ Como rodar o projeto localmente
1️⃣ Clone o repositório
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
2️⃣ Instale as dependências
npm install
3️⃣ Configure o Firebase

Acesse o site do Firebase e siga os passos:

🔹 Criar projeto
Clique em "Adicionar projeto"
Dê um nome ao projeto
🔹 Ativar Authentication
Vá em Authentication
Ative o método de login (Email/Senha)
🔹 Criar Firestore
Vá em Firestore Database
Clique em Criar banco de dados
Inicie em modo de teste
4️⃣ Adicione suas credenciais Firebase

Crie um arquivo:

src/firebaseConfig.js

E adicione:

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_BUCKET",
  messagingSenderId: "SEU_ID",
  appId: "SEU_APP_ID"
};

export default firebaseConfig;
5️⃣ Configure as regras do Firestore

No painel do Firebase, vá em Firestore → Rules e use:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId}/produtos/{productId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

  }
}
6️⃣ Execute o projeto
npm run dev

ou

npm start
🧪 Como usar
Faça login com um usuário
Cadastre um produto
Veja os produtos sendo exibidos na tela
Os dados ficam salvos no Firestore vinculados ao seu usuário
⚠️ Observações importantes
Cada usuário vê apenas seus próprios produtos
O projeto utiliza Date.now() para ordenação dos produtos
É necessário estar autenticado para acessar os dados
📌 Possíveis melhorias
✏️ Edição de produtos
🗑️ Exclusão de produtos
🔎 Filtro e busca
📊 Dashboard com estatísticas
👨‍💻 Autor

Desenvolvido por Vinicius Santos
