// api/service/VilaoService.js
const VilaoDAO = require("../dao/VilaoDAO");
const PoderDAO = require("../dao/PoderDAO"); // Pode ser necessário para validação do poder
const Vilao = require("../model/Vilao"); // Para criar instâncias de Vilao para validação
const ErrorResponse = require("../utils/ErrorResponse");

module.exports = class VilaoService {
    #vilaoDAO;
    #poderDAO;

    constructor(vilaoDAODependency, poderDAODependency) {
        console.log("⬆️  VilaoService.constructor()");
        this.#vilaoDAO = vilaoDAODependency;
        this.#poderDAO = poderDAODependency; // Injeta PoderDAO, útil para validar se o poder existe
    }

    // --- Cria um novo vilão ---
    async createVilao(dadosVilao) { // Recebe um POJO com dados do vilão
        console.log("🟢 VilaoService.createVilao() - Dados recebidos para criação:", dadosVilao);
        try {
            // 1. Cria uma instância de Vilao para validação dos dados de entrada
            // Esta instância terá o método getPoderId()
            const novoVilaoInstance = new Vilao(dadosVilao);

            // 2. Opcional: Valida se o poder_idPoder (se fornecido) realmente existe no banco
            if (novoVilaoInstance.getPoderId() !== null) {
                const poderExiste = await this.#poderDAO.findById(novoVilaoInstance.getPoderId());
                if (!poderExiste) {
                    throw new ErrorResponse("Poder associado não encontrado.", 400);
                }
            }

            // 3. Chama o DAO, passando a instância de Vilao (o DAO usará getPoderId())
            const novoVilaoId = await this.#vilaoDAO.create(novoVilaoInstance);
            
            // 4. Busca o vilão recém-criado para retornar o POJO completo e consistente
            const vilaoCriadoData = await this.#vilaoDAO.findById(novoVilaoId);
            if (!vilaoCriadoData) {
                throw new ErrorResponse("Erro interno: Vilão criado, mas não recuperável.", 500);
            }
            console.log("🟢 VilaoService.createVilao() - Vilão criado e recuperado (POJO):", vilaoCriadoData);
            return vilaoCriadoData; // Retorna o POJO
        } catch (error) {
            console.error("ERRO em VilaoService.createVilao:", error.message, "Dados:", dadosVilao);
            if (error instanceof ErrorResponse) throw error;
            throw new ErrorResponse("Falha ao criar vilão: " + error.message, 400); // Bad Request para erros de validação
        }
    }

    // --- Lista todos os vilões ---
    async findAll() {
        console.log("🟢 VilaoService.findAll()");
        try {
            // O DAO já retorna um array de POJOs, então apenas repassamos
            const vilaosDoBanco = await this.#vilaoDAO.findAll();
            console.log("🟢 VilaoService.findAll() - Vilões do DAO (POJOs):", vilaosDoBanco);
            return vilaosDoBanco; // Retorna o array de POJOs diretamente
        } catch (error) {
            console.error("ERRO em VilaoService.findAll:", error.message);
            throw new ErrorResponse("Falha ao buscar vilões.", 500);
        }
    }

    // --- Busca um vilão por ID ---
    async findById(idVilao) {
        console.log("🟢 VilaoService.findById() - Buscando ID:", idVilao);
        try {
            // O DAO já retorna um POJO ou null, então apenas repassamos
            const vilaoData = await this.#vilaoDAO.findById(idVilao);
            
            if (!vilaoData) {
                // Se não encontrar, lança um erro 404
                throw new ErrorResponse("Vilão não encontrado.", 404, {
                    message: `Vilão com ID ${idVilao} não foi encontrado.`
                });
            }
            console.log("🟢 VilaoService.findById() - Vilão encontrado (POJO):", vilaoData);
            return vilaoData; // Retorna o POJO diretamente
        } catch (error) {
            console.error("ERRO em VilaoService.findById:", error.message);
            if (error instanceof ErrorResponse) throw error;
            throw new ErrorResponse("Falha ao buscar vilão por ID.", 500);
        }
    }

    // --- Atualiza um vilão existente ---
    async updateVilao(idVilao, dadosVilao) {
        console.log("🟢 VilaoService.updateVilao() - ID:", idVilao, "Novos dados:", dadosVilao);
        try {
            // 1. Verifica se o vilão existe antes de tentar atualizar
            const vilaoExistente = await this.#vilaoDAO.findById(idVilao);
            if (!vilaoExistente) {
                throw new ErrorResponse("Vilão não encontrado para atualização.", 404, { message: `Vilão com ID ${idVilao} não foi encontrado para atualização.` });
            }

            // 2. Cria uma instância de Vilao para validação dos dados de atualização
            // Inclui o ID para que o setter de ID seja validado também
            const vilaoParaAtualizarInstance = new Vilao({ ...dadosVilao, idVilao: idVilao });

            // 3. Opcional: Valida se o poder_idPoder (se fornecido) realmente existe no banco
            if (vilaoParaAtualizarInstance.getPoderId() !== null) {
                const poderExiste = await this.#poderDAO.findById(vilaoParaAtualizarInstance.getPoderId());
                if (!poderExiste) {
                    throw new ErrorResponse("Poder associado não encontrado para atualização.", 400);
                }
            }

            // 4. Chama o DAO para atualizar, passando a instância de Vilao
            const sucessoAtualizacao = await this.#vilaoDAO.update(vilaoParaAtualizarInstance);
            
            if (!sucessoAtualizacao) {
                throw new ErrorResponse("Nenhuma alteração detectada ou falha ao atualizar vilão.", 400);
            }
            
            // 5. Busca o vilão atualizado para retornar o POJO completo e consistente
            const vilaoAtualizadoData = await this.#vilaoDAO.findById(idVilao);
            if (!vilaoAtualizadoData) {
                 throw new ErrorResponse("Erro interno: Vilão atualizado, mas não recuperável.", 500);
            }
            console.log("🟢 VilaoService.updateVilao() - Vilão atualizado e recuperado (POJO):", vilaoAtualizadoData);
            return vilaoAtualizadoData; // Retorna o POJO atualizado
        } catch (error) {
            console.error("ERRO em VilaoService.updateVilao:", error.message, "ID:", idVilao, "Dados:", dadosVilao);
            if (error instanceof ErrorResponse) throw error;
            throw new ErrorResponse("Falha ao atualizar vilão: " + error.message, 400);
        }
    }

    // --- Exclui um vilão ---
    async deleteVilao(idVilao) {
        console.log("🟢 VilaoService.deleteVilao() - Excluindo ID:", idVilao);
        try {
            // 1. Verifica se o vilão existe antes de tentar excluir
            const vilaoExistente = await this.#vilaoDAO.findById(idVilao);
            if (!vilaoExistente) {
                throw new ErrorResponse("Vilão não encontrado para exclusão.", 404, { message: `Vilão com ID ${idVilao} não foi encontrado para exclusão.` });
            }
            
            // 2. Chama o DAO para excluir
            const sucessoExclusao = await this.#vilaoDAO.delete(idVilao);

            if (!sucessoExclusao) {
                throw new ErrorResponse("Falha ao excluir vilão: nenhuma linha afetada.", 500);
            }
            console.log(`🟢 VilaoService.deleteVilao() - Vilão ID ${idVilao} excluído com sucesso.`);
            return true; // Retorna true em caso de sucesso
        } catch (error) {
            console.error("ERRO em VilaoService.deleteVilao:", error.message, "ID:", idVilao);
            if (error instanceof ErrorResponse) throw error;
            throw new ErrorResponse("Falha ao excluir vilão.", 500);
        }
    }
};