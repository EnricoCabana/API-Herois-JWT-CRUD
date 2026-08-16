const HeroiService = require("../service/HeroiService");
const ErrorResponse = require("../utils/ErrorResponse"); // Certifique-se de que ErrorResponse está importado

module.exports = class HeroiControl {
    #heroiService;

    constructor(heroiServiceDependency) {
        console.log("⬆️  HeroiControl.constructor()");
        this.#heroiService = heroiServiceDependency;

        // BIND dos métodos para garantir que 'this' se refira à instância do controller
        this.store = this.store.bind(this);
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    async store(request, response, next) {
        console.log("🔵 HeroiControl.store()");
        try {
            const dadosHeroi = request.body.heroi; // Pega o objeto { nomeHeroi: "...", poder: {...} }
            const resultado = await this.#heroiService.createHeroi(dadosHeroi); // Retorna um POJO

            response.status(201).json({
                success: true,
                message: "Herói cadastrado com sucesso!",
                data: { heroi: resultado } // <-- CORRIGIDO AQUI: 'resultado' já é um POJO
            });
        } catch (error) {
            next(error);
        }
    }

    async index(request, response, next) {
        console.log("🔵 HeroiControl.index()");
        try {
            const listaHerois = await this.#heroiService.findAll(); // Retorna um array de POJOs

            response.status(200).json({
                success: true,
                message: "Lista de heróis retornada com sucesso.",
                data: { herois: listaHerois }
            });
        } catch (error) {
            next(error);
        }
    }

    async show(request, response, next) {
        console.log("🔵 HeroiControl.show()");
        try {
            const idHeroi = parseInt(request.params.idHeroi);
            const heroi = await this.#heroiService.findById(idHeroi); // Retorna um POJO

            response.status(200).json({
                success: true,
                message: "Herói encontrado com sucesso.",
                data: heroi // <-- CORRIGIDO AQUI: 'heroi' já é um POJO
            });
        } catch (error) {
            next(error);
        }
    }

    async update(request, response, next) {
        console.log("🔵 HeroiControl.update()");
        try {
            const idHeroi = parseInt(request.params.idHeroi);
            const dadosHeroi = request.body.heroi; // Pega o objeto { nomeHeroi: "...", poder: {...} }

            const heroiAtualizado = await this.#heroiService.updateHeroi(idHeroi, dadosHeroi); // Retorna um POJO

            response.status(200).json({
                success: true,
                message: "Herói atualizado com sucesso.",
                data: {
                    heroi: heroiAtualizado // <-- CORRIGIDO AQUI: 'heroiAtualizado' já é um POJO
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async destroy(request, response, next) {
        console.log("🔵 HeroiControl.destroy()");
        try {
            const idHeroi = parseInt(request.params.idHeroi);
            await this.#heroiService.deleteHeroi(idHeroi);

            response.status(204).send(); // 204 No Content para exclusão bem-sucedida sem corpo de resposta
        } catch (error) {
            next(error);
        }
    }
};