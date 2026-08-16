# API Heróis JWT CRUD

API REST em Node.js para gerenciamento de Heróis, Vilões e Poderes, com autenticação via JWT e interface web para login, cadastro, listagem, edição e exclusão. Desenvolvido para o 3º Bimestre da disciplina de Programação para Aplicações Web (PAW), Colégios Univap.

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)

---

## Funcionalidades

- Login com autenticação JWT, com token exigido em todas as rotas protegidas da API
- Cadastro (POST) de Heróis, Vilões e Poderes, com interface visual consumindo a API
- Listagem (GET) de todas as entidades
- Edição (PUT) e exclusão (DELETE) das três entidades
- Senhas de usuário armazenadas com **bcrypt**
- Middleware de autorização por role (`authorize`)

## Tecnologias

| Camada     | Tecnologias                                        |
| ---------- | --------------------------------------------------- |
| Backend    | Node.js, Express, jsonwebtoken, bcryptjs, dotenv     |
| Banco      | MySQL (driver mysql2, com prepared statements)       |
| Frontend   | HTML, CSS (Bootstrap), JavaScript (módulos ES)        |

## Arquitetura

O backend segue uma arquitetura em camadas, com injeção de dependência manual feita no `Server.js`:

```
Requisição → Router → JwtMiddleware → Controller → Service → DAO → MySQL
```

- **Router**: define as rotas de cada entidade (`HeroiRoteador`, `VilaoRoteador`, `PoderRoteador`, `UserRoteador`)
- **JwtMiddleware**: valida o token Bearer e anexa o usuário decodificado à requisição; `authorize` restringe por role
- **Controller**: recebe a requisição e delega para o service
- **Service**: regras de negócio
- **DAO**: acesso ao banco com SQL parametrizado (`pool.execute`)
- **Model**: entidades de domínio (`Heroi`, `Vilao`, `Poder`, `User`, `Role`)

## Estrutura de pastas

```
API_BOBA/
├── app.js                    # Ponto de entrada
├── Server.js                 # Configuração do Express e injeção de dependências
├── api/
│   ├── control/               # Controllers
│   ├── service/                # Regras de negócio
│   ├── dao/                    # Acesso ao banco de dados
│   ├── model/                  # Entidades de domínio
│   ├── middleware/             # Autenticação (JWT) e validações
│   ├── router/                 # Definição das rotas
│   ├── database/               # Conexão MySQL
│   ├── http/                   # Classe do token JWT
│   └── utils/                  # Logger e tratamento de erros
├── docs/
│   └── banco.sql              # Criação do banco de dados
└── static/                    # Frontend
    ├── Login.html
    ├── Herois.html
    ├── Viloes.html
    ├── Poderes.html
    ├── dashboard.html
    └── ApiService.js          # Cliente HTTP (GET/POST/PUT/DELETE com Bearer token)
```

## Requisitos

- Node.js
- MySQL

## Como rodar

1. **Instale as dependências**

   ```bash
   npm install
   ```

2. **Crie o banco de dados**

   Importe especificando UTF-8 no cliente — sem isso, nomes com acento (ex: "Força") podem gravar com caracteres corrompidos:

   ```bash
   mysql --default-character-set=utf8mb4 -u root -p < docs/banco.sql
   ```

3. **Configure as variáveis de ambiente**

   Crie um arquivo `.env` na raiz do projeto com a chave do JWT e os dados de acesso ao MySQL. O `.env` não deve ser versionado.

4. **Inicie o servidor**

   ```bash
   node app.js
   ```

   A API sobe em `http://localhost:8080`. A interface web fica disponível nos arquivos da pasta `static/` (`Login.html` como ponto de entrada).

## Segurança

- Senhas armazenadas com **bcrypt**
- Autenticação por **token JWT (Bearer)** em todas as rotas protegidas
- Autorização por **role** via `JwtMiddleware.authorize`
- Consultas ao banco com **prepared statements** (proteção contra SQL Injection)

---

## Contexto acadêmico

Projeto do 3º Bimestre da disciplina de Programação para Aplicações Web (PAW), Colégios Univap, desenvolvido em grupo por Enrico Cabana Nascimento, João Paulo dos Santos Felix e Igor Garcez de Oliveira.
