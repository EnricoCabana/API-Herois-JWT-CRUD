// api/middlewares/PoderMiddleware.js (Ajuste)
const ErrorResponse = require("../utils/ErrorResponse");

module.exports = class PoderMiddleware {

    static validatePoderData(request, response, next) {
        console.log("🔷 PoderMiddleware.validatePoderData()");
        // CORREÇÃO AQUI: Desestrutura o objeto 'poder' dentro de request.body
        const { poder } = request.body; 

        // Adicione uma validação para garantir que 'poder' exista
        if (!poder || typeof poder !== 'object') {
            return next(new ErrorResponse(
                400,
                "Erro na validação de dados",
                { message: "O corpo da requisição deve conter um objeto 'poder'." }
            ));
        }

        const { nomePoder, descricao } = poder; // Agora desestrutura de 'poder'

        // Validação para nomePoder (obrigatório para POST/PUT)
        if (!nomePoder || typeof nomePoder !== 'string' || nomePoder.trim().length < 3) {
            return next(new ErrorResponse(
                400,
                "Erro na validação de dados",
                { message: "O campo 'nomePoder' é obrigatório, deve ser uma string e ter no mínimo 3 caracteres." }
            ));
        }

        // Validação para descricao (opcional, mas se presente, deve ser string e não vazia)
        if (descricao !== undefined && descricao !== null) {
            if (typeof descricao !== 'string' || descricao.trim().length === 0) {
                return next(new ErrorResponse(
                    400,
                    "Erro na validação de dados",
                    { message: "O campo 'descricao' deve ser uma string não vazia ou nula." }
                ));
            }
        }
        
        // Opcional: Anexar os dados do poder diretamente ao request para facilitar o controller
        // request.poderData = poder; // Para que o controller possa usar request.poderData

        next(); // Passa para o próximo middleware ou controller
    }

    /**
     * Valida o parâmetro de rota 'idPoder' em requisições que necessitam de identificação do poder.
     *
     * Verifica:
     * - Se o parâmetro 'idPoder' foi passado na URL.
     * - Se é um número inteiro positivo.
     *
     * @param {Request} request - Objeto de requisição do Express
     * @param {Response} response - Objeto de resposta do Express
     * @param {Function} next - Função next() para passar para o próximo middleware
     *
     * Lança ErrorResponse com código HTTP 400 caso 'idPoder' não seja válido.
     */
    // ALTERAÇÃO AQUI: de static validateIdParam = () => para static validateIdParam()
    static validateIdParam(request, response, next) {
        console.log("🔷 PoderMiddleware.validateIdParam()");
        const { idPoder } = request.params;

        if (!idPoder) {
            return next(new ErrorResponse(
                400,
                "Erro na validação de dados",
                { message: "O parâmetro 'idPoder' é obrigatório na URL." }
            ));
        }

        const parsedId = parseInt(idPoder, 10);
        if (isNaN(parsedId) || parsedId <= 0) {
            return next(new ErrorResponse(
                400,
                "Erro na validação de dados",
                { message: "O 'idPoder' deve ser um número inteiro positivo." }
            ));
        }

        // Opcional: Anexar o ID parseado ao request para facilitar o uso no controller
        request.parsedIdPoder = parsedId;

        next(); // Passa para o próximo middleware ou controller
    } // Fim de validateIdParam()
};