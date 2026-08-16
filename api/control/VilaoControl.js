const VilaoService = require("../service/VilaoService");
const ErrorResponse = require("../utils/ErrorResponse"); // Certifique-se de que ErrorResponse está importado

module.exports = class VilaoControl {
    #vilaoService;

    constructor(vilaoServiceDependency) {
        console.log("⬆️  VilaoControl.constructor()");
        this.#vilaoService = vilaoServiceDependency;

        // BIND dos métodos para garantir que 'this' se refira à instância do controller
        this.store = this.store.bind(this);
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    async store(request, response, next) {
        console.log("🔵 VilaoControl.store()");
        try {
            const dadosVilao = request.body.vilao; // Pega o objeto { nomeVilao: "...", poder: {...} }
            const resultado = await this.#vilaoService.createVilao(dadosVilao); // Retorna um POJO

            response.status(201).json({
                success: true,
                message: "Vilão cadastrado com sucesso!",
                data: { vilao: resultado } // <-- CORRIGIDO AQUI: 'resultado' já é um POJO
            });
        } catch (error) {
            next(error);
        }
    }

    async index(request, response, next) {
        console.log("🔵 VilaoControl.index()");
        try {
            const listaVilaos = await this.#vilaoService.findAll(); // Retorna um array de POJOs

            response.status(200).json({
                success: true,
                message: "Lista de vilões retornada com sucesso.",
                data: { viloes: listaVilaos } // <-- CORRIGIDO AQUI: 'listaVilaos' já é um array de POJOs
            });
        } catch (error) {
            next(error);
        }
    }

    async show(request, response, next) {
        console.log("🔵 VilaoControl.show()");
        try {
            const idVilao = parseInt(request.params.idVilao);
            const vilao = await this.#vilaoService.findById(idVilao); // Retorna um POJO

            response.status(200).json({
                success: true,
                message: "Vilão encontrado com sucesso.",
                data: vilao // <-- CORRIGIDO AQUI: 'vilao' já é um POJO
            });
        } catch (error) {
            next(error);
        }
    }

    async update(request, response, next) {
        console.log("🔵 VilaoControl.update()");
        try {
            const idVilao = parseInt(request.params.idVilao);
            const dadosVilao = request.body.vilao; // Pega o objeto { nomeVilao: "...", poder: {...} }

            const vilaoAtualizado = await this.#vilaoService.updateVilao(idVilao, dadosVilao); // Retorna um POJO

            response.status(200).json({
                success: true,
                message: "Vilão atualizado com sucesso.",
                data: {
                    vilao: vilaoAtualizado // <-- CORRIGIDO AQUI: 'vilaoAtualizado' já é um POJO
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async destroy(request, response, next) {
        console.log("🔵 VilaoControl.destroy()");
        try {
            const idVilao = parseInt(request.params.idVilao);
            await this.#vilaoService.deleteVilao(idVilao);

            response.status(204).send(); // 204 No Content para exclusão bem-sucedida sem corpo de resposta
        } catch (error) {
            next(error);
        }
    }
};