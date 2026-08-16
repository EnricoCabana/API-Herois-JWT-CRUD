// api/control/UserControl.js
const UserService = require("../service/UserService");
const Logger = require("../utils/Logger");
const { ErrorResponse } = require("../utils/ErrorResponse"); // Para tratar erros específicos se necessário

/**
 * Classe responsável por controlar os endpoints da API REST para a entidade User (autenticação).
 */
module.exports = class UserControl {
    #userService;

    /**
     * Construtor da classe UserControl
     * @param {UserService} userServiceDependency - Instância do UserService
     */
    constructor(userServiceDependency) {
        console.log("⬆️  UserControl.constructor()");
        this.#userService = userServiceDependency;
    }

    /**
     * Registra um novo usuário.
     * @param {Object} request - Objeto da requisição Express.js com os dados do usuário.
     * @param {Object} response - Objeto da resposta Express.js.
     * @param {Function} next - Middleware de tratamento de erros.
     */
    register = async (request, response, next) => {
        Logger.log("🔵 UserControl.register()");
        try {
            const userData = request.body; // Assume que o body contém diretamente username, email, password, role
            const newUser = await this.#userService.registerUser(userData);

            response.status(201).json({
                success: true,
                message: "Usuário registrado com sucesso!",
                data: { user: newUser }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Autentica um usuário pelo email/username e senha.
     * @param {Object} request - Objeto da requisição Express.js contendo identifier e password.
     * @param {Object} response - Objeto da resposta Express.js.
     * @param {Function} next - Middleware de tratamento de erros.
     */
    login = async (request, response, next) => {
        Logger.log("🔵 UserControl.login()");
        try {
            const loginData = request.body; // Assume que o body contém diretamente identifier, password
            const result = await this.#userService.loginUser(loginData);

            response.status(200).json({
                success: true,
                message: "Login efetuado com sucesso!",
                data: result // Contém { user, token }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retorna o perfil do usuário autenticado.
     * @param {Object} request - Objeto da requisição Express.js (contém req.user do JWT).
     * @param {Object} response - Objeto da resposta Express.js.
     * @param {Function} next - Middleware de tratamento de erros.
     */
    getProfile = async (request, response, next) => {
        Logger.log("🔵 UserControl.getProfile()");
        try {
            // req.user é populado pelo JwtMiddleware após verificar o token
            const userId = request.user.userId;
            const userProfile = await this.#userService.getUserProfile(userId);

            response.status(200).json({
                success: true,
                message: "Perfil do usuário obtido com sucesso.",
                data: { user: userProfile }
            });
        } catch (error) {
            next(error);
        }
    }

    // Você pode adicionar outros métodos de controle aqui se precisar (ex: updateUserProfile)
};