Catálogo Pro

Sistema web desenvolvido com React + Vite para gerenciamento de produtos, permitindo cadastro, listagem e controle de valores de forma simples e eficiente.

Sobre o projeto

O Catálogo Pro é uma aplicação front-end criada com foco em boas práticas de desenvolvimento com React, incluindo:

Componentização
Gerenciamento de estado
Validação de formulários
Experiência do usuário (UX)
Funcionalidades
Cadastro de produtos com validação
Listagem dinâmica em tempo real
Cálculo automático do valor total
Remoção de produtos com confirmação
Feedback visual de erros e status
Foco automático no input
Layout responsivo

Tecnologias
Tecnologia	Descrição
React	Biblioteca para interfaces
Vite	Build tool rápida
JavaScript	Lógica da aplicação
CSS	Estilização
Estrutura do projeto
prova-dw3-vinicius-santos
├── public
├── src
│   ├── assets
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
└── vite.config.js
Instalação e execução

Clone o repositório:

git clone https://github.com/seu-usuario/catalogo-pro.git

Acesse a pasta:

cd catalogo-pro

Instale as dependências:

npm install

Execute o projeto:

npm run dev

Abra no navegador:

http://localhost:5173
Validações implementadas
Nome do produto
Obrigatório
Mínimo de 2 caracteres
Preço
Deve ser numérico
Maior que zero
Limite máximo para evitar valores irreais
Conceitos aplicados
useState (estado da aplicação)
useEffect (efeitos colaterais)
useRef (controle de foco)
Renderização condicional
Manipulação de listas
Boas práticas de UX/UI
Interface
Tema escuro moderno
Animações suaves
Feedback visual de erros
Modal de confirmação
Responsividade
Possíveis melhorias futuras
Integração com API (backend)
Persistência com banco de dados
Filtro e busca de produtos
Sistema de categorias
Dashboard com gráficos
Licença

Este projeto está sob a licença MIT.
Sinta-se livre para usar e modificar.

Autor

Vinicius Gonçalves Oliveira Santos
