// api/service/HeroiService.js
const HeroiDAO = require("../dao/HeroiDAO");
const PoderDAO = require("../dao/PoderDAO"); // Pode ser necessário para validação do poder
const Heroi = require("../model/Heroi"); // Para criar instâncias de Heroi para validação
const ErrorResponse = require("../utils/ErrorResponse");

module.exports = class HeroiService {
    #heroiDAO;
    #poderDAO;

    constructor(heroiDAODependency, poderDAODependency) {
        console.log("⬆️  HeroiService.constructor()");
        this.#heroiDAO = heroiDAODependency;
        this.#poderDAO = poderDAODependency;
    }

    // --- Cria um novo herói ---
    async createHeroi(dadosHeroi) {
        console.log("🟢 HeroiService.createHeroi() - Dados recebidos para criação:", dadosHeroi);
        try {
            // 1. Cria uma instância de Heroi para validação dos dados de entrada
            // Esta instância terá o método getPoderId()
            const novoHeroiInstance = new Heroi(dadosHeroi);

            // 2. Opcional: Valida se o poder_idPoder (se fornecido) realmente existe no banco
            if (novoHeroiInstance.getPoderId() !== null) {
                const poderExiste = await this.#poderDAO.findById(novoHeroiInstance.getPoderId());
                if (!poderExiste) {
                    throw new ErrorResponse("Poder associado não encontrado.", 400);
                }
            }

            // 3. Chama o DAO, passando a instância de Heroi (o DAO usará getPoderId())
            const novoHeroiId = await this.#heroiDAO.create(novoHeroiInstance);
            
            // 4. Busca o herói recém-criado para retornar o POJO completo e consistente
            const heroiCriadoData = await this.#heroiDAO.findById(novoHeroiId);
            if (!heroiCriadoData) {
                throw new ErrorResponse("Erro interno: Herói criado, mas não recuperável.", 500);
            }
            console.log("🟢 HeroiService.createHeroi() - Herói criado e recuperado (POJO):", heroiCriadoData);
            return heroiCriadoData; // Retorna o POJO
        } catch (error) {
            console.error("ERRO em HeroiService.createHeroi:", error.message, "Dados:", dadosHeroi);
            if (error instanceof ErrorResponse) throw error;
            throw new ErrorResponse("Falha ao criar herói: " + error.message, 400); // Bad Request para erros de validação
        }
    }

    // --- Lista todos os heróis ---
    async findAll() {
        console.log("🟢 HeroiService.findAll()");
        try {
            // O DAO já retorna um array de POJOs, então apenas repassamos
            const heroisDoBanco = await this.#heroiDAO.findAll();
            console.log("🟢 HeroiService.findAll() - Heróis do DAO (POJOs):", heroisDoBanco);
            return heroisDoBanco; // Retorna o array de POJOs diretamente
        } catch (error) {
            console.error("ERRO em HeroiService.findAll:", error.message);
            throw new ErrorResponse("Falha ao buscar heróis.", 500);
        }
    }

    // --- Busca um herói por ID ---
    async findById(idHeroi) {
        console.log("🟢 HeroiService.findById() - Buscando ID:", idHeroi);
        try {
            // O DAO já retorna um POJO ou null, então apenas repassamos
            const heroiData = await this.#heroiDAO.findById(idHeroi);
            
            if (!heroiData) {
                // Se não encontrar, lança um erro 404
                throw new ErrorResponse("Herói não encontrado.", 404, {
                    message: `Herói com ID ${idHeroi} não foi encontrado.`
                });
            }
            console.log("🟢 HeroiService.findById() - Herói encontrado (POJO):", heroiData);
            return heroiData; // Retorna o POJO diretamente
        } catch (error) {
            console.error("ERRO em HeroiService.findById:", error.message);
            if (error instanceof ErrorResponse) throw error;
            throw new ErrorResponse("Falha ao buscar herói por ID.", 500);
        }
    }

    // --- Atualiza um herói existente ---
    async updateHeroi(idHeroi, dadosHeroi) {
        console.log("🟢 HeroiService.updateHeroi() - ID:", idHeroi, "Novos dados:", dadosHeroi);
        try {
            // 1. Verifica se o herói existe antes de tentar atualizar
            const heroiExistente = await this.#heroiDAO.findById(idHeroi);
            if (!heroiExistente) {
                throw new ErrorResponse("Herói não encontrado para atualização.", 404, { message: `Herói com ID ${idHeroi} não foi encontrado para atualização.` });
            }

            // 2. Cria uma instância de Heroi para validação dos dados de atualização
            // Inclui o ID para que o setter de ID seja validado também
            const heroiParaAtualizarInstance = new Heroi({ ...dadosHeroi, idHeroi: idHeroi });

            // 3. Opcional: Valida se o poder_idPoder (se fornecido) realmente existe no banco
            if (heroiParaAtualizarInstance.getPoderId() !== null) {
                const poderExiste = await this.#poderDAO.findById(heroiParaAtualizarInstance.getPoderId());
                if (!poderExiste) {
                    throw new ErrorResponse("Poder associado não encontrado para atualização.", 400);
                }
            }

            // 4. Chama o DAO para atualizar, passando a instância de Heroi
            const sucessoAtualizacao = await this.#heroiDAO.update(heroiParaAtualizarInstance);
            
            if (!sucessoAtualizacao) {
                throw new ErrorResponse("Nenhuma alteração detectada ou falha ao atualizar herói.", 400);
            }
            
            // 5. Busca o herói atualizado para retornar o POJO completo e consistente
            const heroiAtualizadoData = await this.#heroiDAO.findById(idHeroi);
            if (!heroiAtualizadoData) {
                 throw new ErrorResponse("Erro interno: Herói atualizado, mas não recuperável.", 500);
            }
            console.log("🟢 HeroiService.updateHeroi() - Herói atualizado e recuperado (POJO):", heroiAtualizadoData);
            return heroiAtualizadoData; // Retorna o POJO atualizado
        } catch (error) {
            console.error("ERRO em HeroiService.updateHeroi:", error.message, "ID:", idHeroi, "Dados:", dadosHeroi);
            if (error instanceof ErrorResponse) throw error;
            throw new ErrorResponse("Falha ao atualizar herói: " + error.message, 400);
        }
    }

    // --- Exclui um herói ---
    async deleteHeroi(idHeroi) {
        console.log("🟢 HeroiService.deleteHeroi() - Excluindo ID:", idHeroi);
        try {
            // 1. Verifica se o herói existe antes de tentar excluir
            const heroiExistente = await this.#heroiDAO.findById(idHeroi);
            if (!heroiExistente) {
                throw new ErrorResponse("Herói não encontrado para exclusão.", 404, { message: `Herói com ID ${idHeroi} não foi encontrado para exclusão.` });
            }
            
            // 2. Chama o DAO para excluir
            const sucessoExclusao = await this.#heroiDAO.delete(idHeroi);

            if (!sucessoExclusao) {
                throw new ErrorResponse("Falha ao excluir herói: nenhuma linha afetada.", 500);
            }
            console.log(`🟢 HeroiService.deleteHeroi() - Herói ID ${idHeroi} excluído com sucesso.`);
            return true; // Retorna true em caso de sucesso
        } catch (error) {
            console.error("ERRO em HeroiService.deleteHeroi:", error.message, "ID:", idHeroi);
            if (error instanceof ErrorResponse) throw error;
            throw new ErrorResponse("Falha ao excluir herói.", 500);
        }
    }
};