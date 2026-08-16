// api/service/UserService.js
const bcrypt = require('bcryptjs'); // Usado para hash de senhas
const UserDAO = require('../dao/UserDAO');
const User = require('../model/User'); // Seu modelo de usuário
const MeuTokenJWT = require('../http/MeuTokenJWT'); // Seu módulo JWT
const { ErrorResponse, BadRequestError, UnauthorizedError, NotFoundError } = require('../utils/ErrorResponse');

const SALT_ROUNDS = 12; // Custo do hash, como no seu FuncionarioDAO

/**
 * Classe responsável pela camada de serviço para a entidade User.
 */
module.exports = class UserService {
    #userDAO;

    /**
     * Construtor da classe UserService
     * @param {UserDAO} userDAODependency - Instância de UserDAO
     */
    constructor(userDAODependency) {
        console.log("⬆️  UserService.constructor()");
        this.#userDAO = userDAODependency;
    }

    /**
     * Registra um novo usuário.
     *
     * @param {Object} jsonUserData - Objeto contendo dados do usuário para registro.
     * @param {string} jsonUserData.username - Nome de usuário.
     * @param {string} jsonUserData.email - Email do usuário.
     * @param {string} jsonUserData.password - Senha em texto plano.
     * @param {string} [jsonUserData.role='user'] - Role do usuário ('user' ou 'admin').
     * @returns {Promise<User>} - Objeto User criado com ID atribuído.
     * @throws {ErrorResponse} - Em caso de validação de dados inválidos ou usuário/email já existente.
     */
    registerUser = async (jsonUserData) => {
        console.log("🟣 UserService.registerUser()");

        const { username, email, password, role = 'user' } = jsonUserData;

        if (!username || !email || !password) {
            throw new BadRequestError("Todos os campos (username, email, password) são obrigatórios para o registro.");
        }
        if (password.length < 6) { // Exemplo de regra de domínio
            throw new BadRequestError("A senha deve ter no mínimo 6 caracteres.");
        }

        // Criação da instância User (validação de domínio nos setters)
        const newUser = new User();
        newUser.username = username;
        newUser.email = email;
        newUser.role = role; // Assume que a role é validada pelo setter

        // Verificar se username ou email já existem
        const existingUserByUsername = await this.#userDAO.findByUsernameOrEmailWithPassword(username);
        if (existingUserByUsername && existingUserByUsername.username === username) {
            throw new BadRequestError("Nome de usuário já existe.", 409, { field: 'username' });
        }
        const existingUserByEmail = await this.#userDAO.findByUsernameOrEmailWithPassword(email);
        if (existingUserByEmail && existingUserByEmail.email === email) {
            throw new BadRequestError("Email já cadastrado.", 409, { field: 'email' });
        }

        // Criptografa a senha antes de passar para o DAO
        newUser.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Persistência e atribuição de ID
        newUser.id = await this.#userDAO.create(newUser);

        // Retorna o usuário sem a senha hash
        const userWithoutPassword = new User();
        userWithoutPassword.id = newUser.id;
        userWithoutPassword.username = newUser.username;
        userWithoutPassword.email = newUser.email;
        userWithoutPassword.role = newUser.role;

        return userWithoutPassword;
    }

    /**
     * Realiza o login de um usuário.
     *
     * 🔹 Regra de aplicação: valida as credenciais do usuário e retorna um token JWT.
     *
     * @param {Object} loginData - Objeto contendo os dados de login.
     * @param {string} loginData.identifier - Email ou nome de usuário.
     * @param {string} loginData.password - Senha do usuário.
     *
     * @returns {Promise<Object>} - Retorna um objeto contendo:
     *                              { user: { id, username, email, role }, token }
     *
     * @throws {UnauthorizedError} - Lança erro 401 se usuário ou senha forem inválidos.
     */
    loginUser = async (loginData) => {
        console.log("🟣 UserService.loginUser()");

        const { identifier, password } = loginData;

        if (!identifier || !password) {
            throw new BadRequestError("Nome de usuário/email e senha são obrigatórios.");
        }

        // Autentica o usuário usando o DAO
        const authenticatedUser = await this.#userDAO.login(identifier, password);

        if (!authenticatedUser) {
            throw new UnauthorizedError("Credenciais inválidas.", { message: "Verifique seu nome de usuário/email e senha." });
        }

        // Geração de token JWT
        // Seu `MeuTokenJWT` já deve ter um método `gerarToken`
        const jwtPayload = {
            userId: authenticatedUser.id,
            username: authenticatedUser.username,
            email: authenticatedUser.email,
            role: authenticatedUser.role
        };
        const token = MeuTokenJWT.generateToken(jwtPayload); // Ou jwt.gerarToken(jwtPayload); se MeuTokenJWT for uma instância

        return { user: {
            id: authenticatedUser.id,
            username: authenticatedUser.username,
            email: authenticatedUser.email,
            role: authenticatedUser.role
        }, token };
    }

    /**
     * Retorna o perfil de um usuário pelo ID.
     * @param {number} userId - ID do usuário.
     * @returns {Promise<User>} - Objeto User encontrado (sem a senha hash).
     * @throws {NotFoundError} - Se o usuário não for encontrado.
     */
    getUserProfile = async (userId) => {
        console.log(`🟣 UserService.getUserProfile() - ID: ${userId}`);
        const user = await this.#userDAO.findById(userId);

        if (!user) {
            throw new NotFoundError("Usuário não encontrado.", { message: `Não existe usuário com id ${userId}` });
        }

        return user;
    }

    // Você pode adicionar outros métodos como update, delete, findAll aqui se precisar.
};