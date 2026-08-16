// api/control/PoderControl.js
const PoderService = require("../service/PoderService");
const ErrorResponse = require("../utils/ErrorResponse");

module.exports = class PoderControl {
    #poderService;

    constructor(poderServiceDependency) {
        console.log("⬆️  PoderControl.constructor()");
        this.#poderService = poderServiceDependency;

        this.store = this.store.bind(this);
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    // --- ROTA: POST /api/v1/poderes (Cria um novo poder) ---
    async store(request, response, next) {
        console.log("🔵 PoderControl.store() - Dados recebidos:", request.body);
        try {
            const dadosPoder = request.body.poder; 

            if (!dadosPoder || typeof dadosPoder !== 'object') {
                 // Este erro deve ser pego preferencialmente por um middleware de validação
                 throw new ErrorResponse(400, "Formato de dados inválido. Esperado um objeto 'poder'.");
            }

            // CORREÇÃO AQUI:
            // O PoderService.createPoder() JÁ RETORNA O POJO COMPLETO do poder criado.
            // Não é necessário chamar findById novamente no controller.
            const novoPoderCriado = await this.#poderService.createPoder(dadosPoder);
            
            // Se, por alguma razão, o service retornar null (o que não deveria acontecer com as validações atuais), trate aqui.
            if (!novoPoderCriado) {
                // Isso indicaria um problema no PoderService.createPoder, que deveria retornar um POJO ou lançar um erro.
                throw new ErrorResponse(500, "Falha inesperada: O serviço não retornou o poder criado.");
            }

            const objResposta = {
                success: true,
                message: "Poder cadastrado com sucesso",
                data: {
                    poder: novoPoderCriado // Use o objeto completo retornado pelo service
                }
            };
            response.status(201).send(objResposta);
        } catch (error) {
            console.error("ERRO em PoderControl.store:", error.message);
            next(error);
        }
    }

    // --- ROTA: GET /api/v1/poderes (Lista todos os poderes) ---
    async index(request, response, next) {
        console.log("🔵 PoderControl.index()");
        try {
            const arrayPoderes = await this.#poderService.findAll();
            console.log("🔵 PoderControl.index() - Poderes recebidos do serviço:", arrayPoderes);

            response.status(200).send({
                success: true,
                message: "Busca de poderes realizada com sucesso",
                data: {
                    poderes: arrayPoderes
                },
            });
        } catch (error) {
            console.error("ERRO em PoderControl.index:", error.message);
            next(error);
        }
    }

    // --- ROTA: GET /api/v1/poderes/{idPoder} (Busca um poder por ID) ---
    async show(request, response, next) {
        console.log("🔵 PoderControl.show() - ID recebido:", request.params.idPoder);
        try {
            const idPoder = parseInt(request.params.idPoder, 10);
            
            // A validação de ID inválido já será feita no Service/DAO.
            const poder = await this.#poderService.findById(idPoder);

            // O service já lança 404 se não encontrar, então esta verificação é redundante se o Service for robusto.
            // Mantenho para clareza, mas o Service já deveria cuidar disso.
            if (!poder) { 
                console.log(`🔵 PoderControl.show() - Poder com ID ${idPoder} não encontrado.`);
                // O PoderService.findById já lança um ErrorResponse(404, ...) se não encontrar.
                // Esta linha aqui seria redundante se o service estiver fazendo o seu trabalho corretamente.
                // Mas se o service está retornando null e não lançando, então esta linha seria ativada.
                throw new ErrorResponse(404, "Poder não encontrado.");
            }

            console.log("🔵 PoderControl.show() - Poder a ser retornado:", poder);

            const objResposta = {
                success: true,
                message: "Poder encontrado com sucesso",
                data: {
                    poder: poder
                }
            };
            response.status(200).send(objResposta);
        } catch (error) {
            console.error("ERRO em PoderControl.show:", error.message);
            next(error);
        }
    }

    // --- ROTA: PUT /api/v1/poderes/{idPoder} (Atualiza um poder) ---
    async update(request, response, next) {
        console.log("🔵 PoderControl.update() - ID:", request.params.idPoder, "Dados:", request.body);
        try {
            const idPoder = parseInt(request.params.idPoder, 10);
            const dadosPoder = request.body.poder; 

            if (!dadosPoder || typeof dadosPoder !== 'object') {
                 throw new ErrorResponse(400, "Formato de dados inválido. Esperado um objeto 'poder'.");
            }

            // O service.updatePoder() já retorna o objeto atualizado (POJO) ou lança um erro.
            const poderAtualizado = await this.#poderService.updatePoder(idPoder, dadosPoder);

            // Se o service retornou null (o que não deveria acontecer com as validações), ou o 404 foi lançado lá.
            if (!poderAtualizado) {
                 // Esta linha só seria alcançada se o service.updatePoder() retornasse null e não lançasse 404.
                 // Mas o service já é projetado para lançar 404, então isso é mais uma camada de segurança.
                 throw new ErrorResponse(404, `Poder com ID ${idPoder} não encontrado para atualização.`);
            }

            return response.status(200).send({
                success: true,
                message: 'Poder atualizado com sucesso',
                data: {
                    poder: poderAtualizado
                }
            });
        } catch (error) {
            console.error("ERRO em PoderControl.update:", error.message);
            next(error);
        }
    }

    // --- ROTA: DELETE /api/v1/poderes/{idPoder} (Exclui um poder) ---
    async destroy(request, response, next) {
        console.log("🔵 PoderControl.destroy() - ID:", request.params.idPoder);
        try {
            const idPoder = parseInt(request.params.idPoder, 10);
            
            // O service.deletePoder() retorna true em caso de sucesso ou lança um erro 404/500.
            await this.#poderService.deletePoder(idPoder);

            // Se chegou aqui, a exclusão foi bem-sucedida e o service não lançou erro.
            return response.status(204).send(); // 204 No Content para exclusão bem-sucedida.
        } catch (error) {
            console.error("ERRO em PoderControl.destroy:", error.message);
            next(error);
        }
    }
};