const express = require("express");
const cors = require("cors");

const ErrorResponse = require("./api/utils/ErrorResponse");
const Logger = require("./api/utils/Logger");
const MeuTokenJWT = require("./api/http/MeuTokenJWT"); // Seu módulo JWT

// SEU Middleware Global de Autenticação e Autorização
const JwtMiddleware = require("./api/middleware/JwtMiddleware"); // <--- MANTENHA O SEU JWT MIDDLEWARE AQUI

// --- MÓDULO PODER ---
const PoderRoteador = require("./api/router/PoderRoteador");
const PoderControl = require("./api/control/PoderControl");
const PoderService = require("./api/service/PoderService");
const PoderDAO = require("./api/dao/PoderDAO");

// --- MÓDULO HERÓI ---
const HeroiRoteador = require("./api/router/HeroiRoteador");
const HeroiControl = require("./api/control/HeroiControl");
const HeroiService = require("./api/service/HeroiService");
const HeroiDAO = require("./api/dao/HeroiDAO");

// --- MÓDULO VILÃO ---
const VilaoRoteador = require("./api/router/VilaoRoteador");
const VilaoControl = require("./api/control/VilaoControl");
const VilaoService = require("./api/service/VilaoService");
const VilaoDAO = require("./api/dao/VilaoDAO");

// --- NOVO MÓDULO USUÁRIO (AUTENTICAÇÃO) ---
const UserRoteador = require("./api/router/UserRoteador");
const UserControl = require("./api/control/UserControl");
const UserService = require("./api/service/UserService");
const UserDAO = require("./api/dao/UserDAO");
const User = require("./api/model/User"); // Opcional, se precisar passar para algum lugar

const MysqlDatabase = require("./api/database/MysqlDatabase");

module.exports = class Server {
    #porta;
    #app;
    #router;

    #database;

    // --- Módulo Poder ---
    #poderRoteador;
    #poderControl;
    #poderService;
    #poderDAO;

    // --- Módulo Herói ---
    #heroiRoteador;
    #heroiControl;
    #heroiService;
    #heroiDAO;

    // --- Módulo Vilão ---
    #vilaoRoteador;
    #vilaoControl;
    #vilaoService;
    #vilaoDAO;

    // --- NOVO Módulo Usuário ---
    #userRoteador;
    #userControl;
    #userService;
    #userDAO;

    constructor(porta) {
        console.log("⬆️  Server.constructor()");
        this.#porta = porta ?? 8080;
    }

    async init() {
        console.log("⬆️  Server.init()");
        this.#app = express();
        this.#router = express.Router();
        this.#app.use(express.json());
        this.#app.use(express.static("static"));
        this.#app.use(cors({ origin: "*" }));

        this.#database = new MysqlDatabase({
            host: "localhost",
            user: "root",
            password: "",
            database: "universo_herois",
            port: 3306,
            waitForConnections: true,
            connectionLimit: 50,
            queueLimit: 10
        });

        await this.#database.connect();

        this.setupUser(); // Configura o módulo de usuário primeiro para que as rotas de login/registro estejam disponíveis
        this.setupPoder();
        this.setupHeroi();
        this.setupVilao();
        this.setupTestRoute();
        this.setupErrorMiddleware();
    }

    // --- MÉTODO PARA USUÁRIO (com pequena mudança) ---
    setupUser() {
        console.log("⬆️  Server.setupUser()");
        this.#userDAO = new UserDAO(this.#database);
        this.#userService = new UserService(this.#userDAO);
        this.#userControl = new UserControl(this.#userService);

        // AQUI: O UserRoteador.js **NÃO** usa AuthMiddleware ou JwtMiddleware.
        // Ele apenas configura as rotas para o UserControl.
        // A rota `/profile` **DENTRO DO UserRoteador** que vai usar JwtMiddleware.authenticate.
        this.#userRoteador = new UserRoteador(this.#userControl);
        this.#app.use("/api/v1/auth", this.#userRoteador.createRoutes());
    }


    setupPoder() {
        console.log("⬆️  Server.setupPoder()");
        // PoderMiddleware é estático, não precisa ser instanciado nem armazenado.

        this.#poderDAO = new PoderDAO(this.#database);
        this.#poderService = new PoderService(this.#poderDAO);
        this.#poderControl = new PoderControl(this.#poderService); // Instância do Controller

        this.#poderRoteador = new PoderRoteador(this.#poderControl);

        // AQUI: Protegendo as rotas de Poder com SEU JwtMiddleware
        this.#app.use(
            "/api/v1/poderes",
            JwtMiddleware.authenticate, // Use seu próprio middleware de autenticação
            this.#poderRoteador.createRoutes()
        );
    }

    setupHeroi() {
        console.log("⬆️  Server.setupHeroi()");
        // HeroiMiddleware é estático, não precisa ser instanciado nem armazenado.

        this.#heroiDAO = new HeroiDAO(this.#database);
        this.#heroiService = new HeroiService(this.#heroiDAO, this.#poderDAO);
        this.#heroiControl = new HeroiControl(this.#heroiService); // Instância do Controller

        this.#heroiRoteador = new HeroiRoteador(this.#heroiControl);

        // AQUI: Protegendo as rotas de Herói com SEU JwtMiddleware
        // Nota: Seu HeroiRoteador.js já está adicionando JwtMiddleware.authenticate individualmente a cada rota.
        // Se você quiser que TODAS as rotas de heróis sejam protegidas E tenham autorização de 'admin',
        // você pode adicionar aqui no .use(). Se HeroiRoteador já faz, isso pode ser redundante
        // ou você pode remover do roteador e deixar aqui.
        this.#app.use(
            "/api/v1/herois",
            JwtMiddleware.authenticate, // Seu roteador já adiciona, mas se adicionar aqui, aplica a todas
            this.#heroiRoteador.createRoutes()
        );
    }

    setupVilao() {
        console.log("⬆️  Server.setupVilao()");

        this.#vilaoDAO = new VilaoDAO(this.#database);
        this.#vilaoService = new VilaoService(this.#vilaoDAO, this.#poderDAO);
        this.#vilaoControl = new VilaoControl(this.#vilaoService);

        this.#vilaoRoteador = new VilaoRoteador(this.#vilaoControl);

        // AQUI: Protegendo as rotas de Vilão com SEU JwtMiddleware
        this.#app.use(
            "/api/v1/viloes",
            JwtMiddleware.authenticate, // Use seu próprio middleware de autenticação
            this.#vilaoRoteador.createRoutes()
        );
    }

    setupTestRoute() {
        console.log("⬆️  Server.setupTestRoute()");
        this.#app.get("/api/v1/test", (req, res) => {
            res.send("API is running! V1");
        });
        this.#app.get("/api/v1/test/protected",
            JwtMiddleware.authenticate, // Protege esta rota de teste também
            (req, res) => {
                res.status(200).json({
                    message: "Você acessou uma rota protegida!",
                    user: req.user // Informações do usuário do token
                });
            }
        );
    }

    setupErrorMiddleware() {
        console.log("⬆️  Server.setupErrorHandler");
        this.#app.use((error, request, response, next) => {
            if (error instanceof ErrorResponse) {
                console.log("🟡 Server.errorHandler() - Erro tratado:");
                console.log(error);
                return response.status(error.httpCode).json({
                    success: false,
                    message: error.message,
                    error: error.error
                });
            }

            const resposta = {
                success: false,
                message: "Ocorreu um erro interno no servidor",
                error: {
                    message: error.message || "Erro interno desconhecido",
                    code: error.code || "SERVER_ERROR",
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                }
            };
            console.error("❌ Erro capturado:", resposta);
            Logger.log(resposta);
            response.status(500).json(resposta);
        });
    }

    run() {
        this.#app.listen(this.#porta, () => {
            console.log(`\n🚀 Servidor rodando em http://localhost:${this.#porta}`);
            console.log(`\n------------------------------------------------------------------`);
            console.log(`➡️  Rotas da API para Autenticação de Usuários:`);
            console.log(`   POST (Registrar): http://localhost:${this.#porta}/api/v1/auth/register`);
            console.log(`   POST (Login):     http://localhost:${this.#porta}/api/v1/auth/login`);
            console.log(`   GET (Perfil):     http://localhost:${this.#porta}/api/v1/auth/profile (PROTEGIDA)`);
            console.log(`\n------------------------------------------------------------------`);
            console.log(`➡️  Rotas da API para Poderes (GET, POST, PUT, DELETE):`);
            console.log(`   GET Todos:        http://localhost:${this.#porta}/api/v1/poderes`);
            console.log(`   GET Por ID:       http://localhost:${this.#porta}/api/v1/poderes/{idPoder}`);
            console.log(`   POST (Criar):     http://localhost:${this.#porta}/api/v1/poderes (PROTEGIDA: ADMIN)`);
            console.log(`   PUT (Atualizar):  http://localhost:${this.#porta}/api/v1/poderes/{idPoder} (PROTEGIDA: ADMIN)`);
            console.log(`   DELETE:           http://localhost:${this.#porta}/api/v1/poderes/{idPoder} (PROTEGIDA: ADMIN)`);
            console.log(`\n------------------------------------------------------------------`);
            console.log(`➡️  Rotas da API para Heróis (GET, POST, PUT, DELETE):`);
            console.log(`   GET Todos:        http://localhost:${this.#porta}/api/v1/herois`);
            console.log(`   GET Por ID:       http://localhost:${this.#porta}/api/v1/herois/{idHeroi}`);
            console.log(`   POST (Criar):     http://localhost:${this.#porta}/api/v1/herois (PROTEGIDA: ADMIN)`);
            console.log(`   PUT (Atualizar):  http://localhost:${this.#porta}/api/v1/herois/{idHeroi} (PROTEGIDA: ADMIN)`);
            console.log(`   DELETE:           http://localhost:${this.#porta}/api/v1/herois/{idHeroi} (PROTEGIDA: ADMIN)`);
            console.log(`\n------------------------------------------------------------------`);
            console.log(`➡️  Rotas da API para Vilões (GET, POST, PUT, DELETE):`);
            console.log(`   GET Todos:        http://localhost:${this.#porta}/api/v1/viloes`);
            console.log(`   GET Por ID:       http://localhost:${this.#porta}/api/v1/viloes/{idVilao}`);
            console.log(`   POST (Criar):     http://localhost:${this.#porta}/api/v1/viloes (PROTEGIDA: ADMIN)`);
            console.log(`   PUT (Atualizar):  http://localhost:${this.#porta}/api/v1/viloes/{idVilao} (PROTEGIDA: ADMIN)`);
            console.log(`   DELETE:           http://localhost:${this.#porta}/api/v1/viloes/{idVilao} (PROTEGIDA: ADMIN)`);
            console.log(`\n------------------------------------------------------------------`);
            console.log(`🔑 Autenticação e Autorização:`);
            console.log(`   1. REGISTRE um novo usuário (se ainda não tiver):`);
            console.log(`      Faça um POST para http://localhost:${this.#porta}/api/v1/auth/register`);
            console.log(`      Corpo da requisição JSON: { "username": "seu_nome", "email": "seu@email.com", "password": "sua_senha", "role": "user" }`);
            console.log(`   2. FAÇA LOGIN para obter um TOKEN JWT:`);
            console.log(`      Faça um POST para http://localhost:${this.#porta}/api/v1/auth/login`);
            console.log(`      Corpo da requisição JSON: { "identifier": "seu@email.com", "password": "sua_senha" }`);
            console.log(`      A resposta incluirá o campo "token".`);
            console.log(`\n   Para rotas PROTEGIDAS (como /profile, ou todas de Heróis/Vilões/Poderes):`);
            console.log(`   Inclua o token no cabeçalho da requisição: `);
            console.log(`   Authorization: Bearer <SEU_TOKEN_AQUI>`);
            console.log(`\n   Para rotas que requerem ADMIN (POST, PUT, DELETE em Poderes, Heróis, Vilões):`);
            console.log(`   Você precisará que a 'role' do seu token seja 'admin'.`);
            console.log(`   Ao registrar, defina "role": "admin" (se permitido pelo seu sistema)`);
            console.log(`   OU atualize a role de um usuário existente no banco de dados para 'admin'.`);
            console.log(`------------------------------------------------------------------\n`);
        });
    }
};