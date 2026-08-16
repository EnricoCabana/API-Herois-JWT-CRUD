const jwt = require('jsonwebtoken');
const ErrorResponse = require("../utils/ErrorResponse"); // <-- Caminho corrigido

// Chave secreta para assinar e verificar tokens.
// É ALTAMENTE RECOMENDADO armazenar esta chave em variáveis de ambiente (.env) em PRODUÇÃO!
// Por enquanto, usaremos uma string fixa. Lembre-se de instalar 'dotenv' e configurá-lo.
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123!@#supersecretkey123!@#'; // Use uma chave forte!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // Tempo de expiração do token (ex: '1h', '60m', '1d')

/**
 * Classe utilitária responsável por gerar e verificar tokens JWT.
 * Foca apenas nas operações essenciais de um JWT para a autenticação da API.
 * Usa um modelo estático para evitar instanciar a classe desnecessariamente.
 */
module.exports = class MeuTokenJWT {
    /**
     * Gera um token JWT.
     * @param {object} payload - Dados a serem incluídos no token (ex: { userId: 1, role: 'admin' }).
     *                         Estes serão os "claims" do token.
     * @returns {string} Token JWT assinado.
     */
    static generateToken(payload) { // <-- AGORA É UM MÉTODO ESTÁTICO
        // As opções de `expiresIn` e `secret` são passadas diretamente para jwt.sign
        // O algoritmo padrão é HS256, a menos que especificado.
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }); // <-- Usa a variável global
    }

    /**
     * Verifica e decodifica um token JWT.
     *
     * @param {string} token - Token JWT a ser verificado.
     * @returns {object} Payload decodificado do token, se válido.
     * @throws {ErrorResponse} Se o token for inválido, expirado ou em formato incorreto.
     */
    static verifyToken(token) {
        if (!token || token.trim() === "") {
            throw new ErrorResponse(401, "Token de autenticação não fornecido.", { code: "TOKEN_MISSING" });
        }

        try {
            // jwt.verify retorna o payload se o token for válido e não expirado
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            // Captura erros específicos do JWT e os traduz para ErrorResponse
            if (error.name === 'TokenExpiredError') {
                throw new ErrorResponse(401, "Token de autenticação expirado.", { code: "TOKEN_EXPIRED" });
            }
            if (error.name === 'JsonWebTokenError') {
                // Inclui erros como 'invalid token', 'malformed token', 'invalid signature'
                throw new ErrorResponse(401, "Token de autenticação inválido.", { code: "TOKEN_INVALID", detail: error.message });
            }
            // Para outros erros inesperados na verificação
            throw new ErrorResponse(500, "Erro interno na verificação do token.", { originalError: error.message });
        }
    }
};