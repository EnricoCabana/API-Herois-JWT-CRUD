// api/dao/UserDAO.js
const bcrypt = require("bcryptjs"); // Use bcryptjs para compatibilidade e performance em Node.js
const User = require("../model/User"); // Importa sua classe modelo User
const MysqlDatabase = require("../database/MysqlDatabase");
const { DatabaseError, NotFoundError } = require("../utils/ErrorResponse"); // Assumindo estes erros

/**
 * Classe responsável por gerenciar operações CRUD e autenticação
 * para a entidade User no banco de dados.
 */
module.exports = class UserDAO {
    #database;

    /**
     * Construtor da classe UserDAO.
     * @param {MysqlDatabase} databaseInstance - Instância de MysqlDatabase para acesso ao banco.
     */
    constructor(databaseInstance) {
        console.log("⬆️  UserDAO.constructor()");
        this.#database = databaseInstance;
    }

    /**
     * Cria um novo usuário no banco de dados.
     * A senha é criptografada no Service antes de chegar aqui.
     *
     * @param {User} userModel - Objeto User a ser inserido.
     * @returns {number} ID do usuário inserido.
     * @throws {DatabaseError} Caso a inserção falhe (ex: duplicidade).
     */
    create = async (userModel) => {
        console.log("🟢 UserDAO.create()");

        const SQL = `
            INSERT INTO usuarios (username, email, password_hash, role)
            VALUES (?, ?, ?, ?);`;
        const params = [
            userModel.username,
            userModel.email,
            userModel.passwordHash,
            userModel.role,
        ];

        try {
            const pool = await this.#database.getPool();
            const [resultado] = await pool.execute(SQL, params);

            if (!resultado.insertId) {
                throw new DatabaseError("Falha ao inserir usuário", 500, { message: "Nenhum ID retornado na inserção." });
            }
            return resultado.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.sqlMessage.includes('username')) {
                    throw new DatabaseError("Nome de usuário já existe.", 409, { field: 'username' });
                }
                if (error.sqlMessage.includes('email')) {
                    throw new DatabaseError("Email já cadastrado.", 409, { field: 'email' });
                }
            }
            throw new DatabaseError("Erro ao criar usuário no banco de dados.", 500, error);
        }
    };

    /**
     * Busca um usuário pelo ID.
     *
     * @param {number} userId - ID do usuário.
     * @returns {User|null} Objeto User encontrado ou null se não existir.
     * @throws {DatabaseError} Em caso de erro no banco de dados.
     */
    findById = async (userId) => {
        console.log(`🟢 UserDAO.findById() - ID: ${userId}`);

        const SQL = `SELECT id, username, email, role, created_at FROM usuarios WHERE id = ?;`;
        const params = [userId];

        try {
            const pool = await this.#database.getPool();
            const [rows] = await pool.execute(SQL, params);

            if (rows.length === 0) {
                return null;
            }

            const row = rows[0];
            const user = new User();
            user.id = row.id;
            user.username = row.username;
            user.email = row.email;
            user.role = row.role;
            user.createdAt = row.created_at;
            // A senha não é retornada por segurança
            return user;
        } catch (error) {
            throw new DatabaseError("Erro ao buscar usuário por ID no banco de dados.", 500, error);
        }
    };

    /**
     * Busca um usuário por username ou email, incluindo a senha hash para autenticação.
     *
     * @param {string} identifier - Username ou email do usuário.
     * @returns {User|null} Objeto User com todos os campos (incluindo password_hash) ou null.
     * @throws {DatabaseError} Em caso de erro no banco de dados.
     */
    findByUsernameOrEmailWithPassword = async (identifier) => {
        console.log(`🟢 UserDAO.findByUsernameOrEmailWithPassword() - Identifier: ${identifier}`);

        const SQL = `SELECT id, username, email, password_hash, role FROM usuarios WHERE username = ? OR email = ?;`;
        const params = [identifier, identifier];

        try {
            const pool = await this.#database.getPool();
            const [rows] = await pool.execute(SQL, params);

            if (rows.length === 0) {
                return null;
            }

            const row = rows[0];
            const user = new User();
            user.id = row.id;
            user.username = row.username;
            user.email = row.email;
            user.passwordHash = row.password_hash; // Necessário para a comparação da senha
            user.role = row.role;
            return user;
        } catch (error) {
            throw new DatabaseError("Erro ao buscar usuário por username/email no banco de dados.", 500, error);
        }
    };

    /**
     * Autentica um usuário verificando email/username e senha.
     *
     * @param {string} identifier - Email ou username do usuário.
     * @param {string} password - Senha em texto plano.
     * @returns {User|null} Objeto User autenticado (sem a senha hash) ou null se falhar.
     * @throws {DatabaseError} Em caso de erro no banco de dados.
     */
    login = async (identifier, password) => {
        console.log("🟢 UserDAO.login()");

        const userDB = await this.findByUsernameOrEmailWithPassword(identifier);

        if (!userDB) {
            console.log("❌ Usuário não encontrado.");
            return null;
        }

        // Verificação da senha
        const senhaValida = await bcrypt.compare(password, userDB.passwordHash);
        if (!senhaValida) {
            console.log("❌ Senha inválida.");
            return null;
        }

        // Retorna o objeto User sem o passwordHash
        const authenticatedUser = new User();
        authenticatedUser.id = userDB.id;
        authenticatedUser.username = userDB.username;
        authenticatedUser.email = userDB.email;
        authenticatedUser.role = userDB.role;

        return authenticatedUser;
    };
};