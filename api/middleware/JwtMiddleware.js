const MeuTokenJWT = require("../http/MeuTokenJWT"); // Caminho para sua classe de token
const ErrorResponse = require("../utils/ErrorResponse"); // Caminho para sua classe de erro

/**
 * Middleware para validação de tokens JWT em requisições.
 *
 * Objetivo:
 * - Garantir que apenas requisições com token válido acessem os endpoints protegidos.
 * - Decodificar o token e anexar as informações do usuário (payload) à requisição (req.user).
 * - Lançar erros padronizados usando ErrorResponse quando a validação falhar.
 */
module.exports = class JwtMiddleware {

    /**
     * Middleware principal de autenticação JWT.
     * Valida o token JWT presente no header 'Authorization' da requisição.
     *
     * Fluxo:
     * 1. Recupera o header 'Authorization' da requisição.
     * 2. Verifica se o token está presente e no formato 'Bearer <token>'.
     * 3. Usa `MeuTokenJWT.verifyToken()` para validar o token.
     * 4. Se o token for válido:
     *    - Anexa o payload decodificado a `request.user`.
     *    - Chama `next()` para prosseguir para o próximo middleware ou controller.
     * 5. Se o token for inválido, ausente ou malformatado:
     *    - `MeuTokenJWT.verifyToken()` já lançará um `ErrorResponse` apropriado,
     *      que será capturado pelo `try/catch` e encaminhado para o `next(error)`.
     *
     * @param {Request} request - Objeto de requisição do Express
     * @param {Response} response - Objeto de resposta do Express
     * @param {Function} next - Função next() para passar para o próximo middleware
     */
    static authenticate = (request, response, next) => {
        console.log("🔷 JwtMiddleware.authenticate()");
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Nenhum token ou formato inválido
            return next(new ErrorResponse(401, "Autenticação necessária. Token Bearer ausente ou malformatado."));
        }

        const token = authHeader.split(' ')[1]; // Extrai o token após 'Bearer '

        try {
            const decoded = MeuTokenJWT.verifyToken(token);
            request.user = decoded; // Anexa as informações do usuário decodificadas à requisição
            next(); // Token válido, prossegue
        } catch (error) {
            // Erro já será um ErrorResponse vindo de MeuTokenJWT.verifyToken,
            // ou um erro capturado no processamento.
            next(error); // Encaminha o erro para o middleware de tratamento de erros global
        }
    };

    /**
     * Middleware de autorização baseado em roles (funções/papéis).
     * @param {Array<string>} allowedRoles - Array de roles permitidas (ex: ['admin', 'editor'])
     * @returns {Function} O middleware de autorização configurado
     */
    static authorize = (allowedRoles) => {
        return (req, res, next) => {
            console.log("🔷 JwtMiddleware.authorize()");
            // Assume que o authenticate middleware já foi executado e req.user está disponível
            if (!req.user || !req.user.role) {
                // Se não há usuário autenticado ou role no token, já é um erro de autenticação ou token malformado
                return next(new ErrorResponse(403, "Acesso negado. Informações de role ausentes no token."));
            }

            // Verifica se a role do usuário está entre as roles permitidas
            if (!allowedRoles.includes(req.user.role)) {
                return next(new ErrorResponse(403, "Acesso negado. Você não tem permissão para realizar esta ação."));
            }

            next(); // Usuário autorizado, prossegue
        };
    };
};