const ErrorResponse = require("../utils/ErrorResponse");

module.exports = class VilaoMiddleware {

    // DEVE SER STATIC
    static validateVilaoBody(request, response, next) { // <--- AQUI DEVE TER 'static'
        console.log("🔷 VilaoMiddleware.validateVilaoBody()");
        const body = request.body;

        if (!body.vilao) {
            return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'vilao' é obrigatório!" }));
        }

        const vilao = body.vilao;

        if (!vilao.nomeVilao || typeof vilao.nomeVilao !== "string" || vilao.nomeVilao.trim().length < 3) {
            return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'nomeVilao' é obrigatório e deve ser uma string com pelo menos 3 caracteres!" }));
        }

        if (vilao.identidadeSecreta !== undefined && vilao.identidadeSecreta !== null) {
            if (typeof vilao.identidadeSecreta !== "string") {
                return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'identidadeSecreta' deve ser uma string ou nulo!" }));
            }
        }

        if (vilao.Poderes_idPoder !== undefined && vilao.Poderes_idPoder !== null) {
            const parsedPoderId = Number(vilao.Poderes_idPoder);
            if (!Number.isInteger(parsedPoderId) || parsedPoderId <= 0) {
                return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'Poderes_idPoder' deve ser um número inteiro positivo ou nulo!" }));
            }
            vilao.Poderes_idPoder = parsedPoderId; // Corrigido para parsedPoderId
        } else if (vilao.Poderes_idPoder === null) {
            vilao.Poderes_idPoder = null;
        }

        next();
    }

    // DEVE SER STATIC
    static validateIdParam(request, response, next) { // <--- AQUI DEVE TER 'static'
        console.log("🔷 VilaoMiddleware.validateIdParam()");
        const { idVilao } = request.params;

        const parsedId = parseInt(idVilao, 10);

        if (!idVilao || isNaN(parsedId) || parsedId <= 0) {
            return next(new ErrorResponse(400, "Erro na validação de ID", { message: "O parâmetro 'idVilao' deve ser um número inteiro positivo!" }));
        }

        request.params.idVilao = parsedId;

        next();
    }
};