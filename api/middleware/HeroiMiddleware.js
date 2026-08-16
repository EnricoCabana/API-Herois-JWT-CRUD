// api/middleware/HeroiMiddleware.js
const ErrorResponse = require("../utils/ErrorResponse");

module.exports = class HeroiMiddleware {

    static validateHeroiBody(request, response, next) {
        console.log("🔷 HeroiMiddleware.validateHeroiBody()");
        const body = request.body;

        if (!body.heroi) {
            return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'heroi' é obrigatório!" }));
        }

        const heroi = body.heroi;

        if (!heroi.nomeHeroi || typeof heroi.nomeHeroi !== "string" || heroi.nomeHeroi.trim().length < 3) {
            return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'nomeHeroi' é obrigatório e deve ser uma string com pelo menos 3 caracteres!" }));
        }

        // Validação de identidadeSecreta
        if (heroi.identidadeSecreta !== undefined && heroi.identidadeSecreta !== null) {
            if (typeof heroi.identidadeSecreta !== "string") {
                return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'identidadeSecreta' deve ser uma string ou nulo!" }));
            }
            // Opcional: Tratar string vazia como null
            if (heroi.identidadeSecreta.trim().length === 0) {
                heroi.identidadeSecreta = null;
            }
        } else {
            // Garante que se não for enviado, seja tratado como null
            heroi.identidadeSecreta = null;
        }


        // Validação de Poderes_idPoder
        if (heroi.Poderes_idPoder !== undefined && heroi.Poderes_idPoder !== null) {
            const parsedPoderId = Number(heroi.Poderes_idPoder);
            if (!Number.isInteger(parsedPoderId) || parsedPoderId <= 0) {
                return next(new ErrorResponse(400, "Erro na validação de dados", { message: "O campo 'Poderes_idPoder' deve ser um número inteiro positivo ou nulo!" }));
            }
            heroi.Poderes_idPoder = parsedPoderId; // <-- CORRIGIDO AQUI!
        } else {
            // Garante que se não for enviado, seja tratado como null
            heroi.Poderes_idPoder = null;
        }

        next();
    }

    static validateIdParam(request, response, next) {
        console.log("🔷 HeroiMiddleware.validateIdParam()");
        const { idHeroi } = request.params;

        const parsedId = parseInt(idHeroi, 10);

        if (!idHeroi || isNaN(parsedId) || parsedId <= 0) {
            return next(new ErrorResponse(400, "Erro na validação de ID", { message: "O parâmetro 'idHeroi' deve ser um número inteiro positivo!" }));
        }

        request.params.idHeroi = parsedId;

        next();
    }
};