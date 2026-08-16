// api/router/UserRoteador.js
const express = require("express");
const UserControl = require("../control/UserControl");
// Use seu próprio JwtMiddleware aqui, não o AuthMiddleware que eu criei
const JwtMiddleware = require("../middleware/JwtMiddleware"); // <--- MUDANÇA AQUI: IMPORTAR SEU JwtMiddleware

/**
 * Classe responsável por configurar as rotas da entidade User (autenticação).
 */
module.exports = class UserRoteador {
    #router;
    #userControl;

    /**
     * Construtor da classe UserRoteador
     * @param {UserControl} userControlDependency
     */
    constructor(userControlDependency) {
        console.log("⬆️  UserRoteador.constructor()");
        this.#router = express.Router();
        this.#userControl = userControlDependency;
    }

    /**
     * Configura as rotas da API REST para autenticação de usuários.
     *
     * Rotas configuradas:
     * POST "/register" -> Registrar um novo usuário (com validação de body)
     * POST "/login"    -> Autenticar um usuário (com validação de body)
     * GET "/profile"   -> Obter perfil do usuário autenticado (requer JWT)
     *
     * @returns {express.Router} Router configurado com todas as rotas de autenticação.
     */
    createRoutes = () => {
        console.log("⬆️  UserRoteador.createRoutes()");

        // ROTA: POST[/auth/register] - Criação de novo usuário
        this.#router.post("/register",
            this.#userControl.register
        );

        // ROTA: POST[/auth/login] - Autenticação de usuário
        this.#router.post("/login",
            this.#userControl.login
        );

        // ROTA: GET[/auth/profile] - Obtenção do perfil do usuário logado
        this.#router.get("/profile",
            JwtMiddleware.authenticate,
            this.#userControl.getProfile
        );

        return this.#router;
    }
};