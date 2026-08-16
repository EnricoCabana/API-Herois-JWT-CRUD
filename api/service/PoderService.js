// api/service/PoderService.js
const PoderDAO = require("../dao/PoderDAO");
const Poder = require("../model/Poder"); // Precisamos da classe Poder para validação
const ErrorResponse = require("../utils/ErrorResponse"); // Importado para lançar erros personalizados

module.exports = class PoderService {
    #poderDAO;

    constructor(poderDAODependency) {
        console.log("⬆️  PoderService.constructor()");
        this.#poderDAO = poderDAODependency;
    }

    // --- Cria um novo poder ---
    async createPoder(dadosPoder) {
        console.log("🟢 PoderService.createPoder() - Dados recebidos para criação:", dadosPoder);
        try {
            // 1. Validação dos dados de entrada usando o modelo Poder
            const novoPoderParaValidar = new Poder(dadosPoder);
            
            // 2. Chama o DAO para criar o poder
            const novoPoderId = await this.#poderDAO.create(novoPoderParaValidar);
            
            // --- ADICIONE ESTE BLOCO DE DIAGNÓSTICO AQUI ---
            console.log(`⭐ DIAGNÓSTICO: PoderService.createPoder() - ID recebido de PoderDAO.create(): ${novoPoderId}, Tipo: ${typeof novoPoderId}`);
            if (novoPoderId === null || novoPoderId === undefined || !Number.isInteger(novoPoderId) || novoPoderId <= 0) {
                 // Este erro indica que o DAO.create não retornou um ID numérico válido.
                 console.error(`🔴 DIAGNÓSTICO: PoderService.createPoder() - ID inválido '${novoPoderId}' retornado por PoderDAO.create().`);
                 throw new ErrorResponse(500, "Erro interno: O ID retornado após a criação do poder é inválido ou ausente.", { idRetornado: novoPoderId });
            }
            // --- FIM BLOCO DE DIAGNÓSTICO ---

            // 3. Busca o poder recém-criado para retornar o POJO completo e consistente
            const poderCriadoData = await this.#poderDAO.findById(novoPoderId);
            
            if (!poderCriadoData) {
                // Isso indicaria um problema sério se a criação foi bem-sucedida mas a busca falhou
                throw new ErrorResponse(500, "Erro interno: Poder criado, mas não recuperável após a busca.");
            }
            console.log("🟢 PoderService.createPoder() - Poder criado e recuperado com sucesso:", poderCriadoData);
            return poderCriadoData; // Retorna o POJO completo vindo do DAO
        } catch (error) {
            console.error("ERRO em PoderService.createPoder:", error.message, "Dados:", dadosPoder);
            if (error instanceof ErrorResponse) throw error;
            throw new ErrorResponse(400, "Falha ao criar poder: " + error.message, { originalError: error.message });
        }
    }

    // --- Lista todos os poderes ---
    async findAll() {
        console.log("🟢 PoderService.findAll()");
        try {
            const poderesDoBanco = await this.#poderDAO.findAll();
            console.log("🟢 PoderService.findAll() - Poderes do DAO (POJOs):", poderesDoBanco);
            return poderesDoBanco;
        } catch (error) {
            console.error("ERRO em PoderService.findAll:", error.message);
            throw new ErrorResponse(500, "Falha ao buscar poderes.", { originalError: error.message });
        }
    }

    // --- Busca um poder por ID ---
    async findById(idPoder) {
        console.log("🟢 PoderService.findById() - Buscando ID:", idPoder);
        try {
            const poderData = await this.#poderDAO.findById(idPoder);
            
            if (!poderData) {
                throw new ErrorResponse(404, "Poder não encontrado.", {
                    message: `Poder com ID ${idPoder} não foi encontrado.`
                });
            }
            console.log("🟢 PoderService.findById() - Poder encontrado (POJO):", poderData);
            return poderData;
        } catch (error) {
            console.error("ERRO em PoderService.findById:", error.message);
            if (error instanceof ErrorResponse) throw error;
            throw new ErrorResponse(500, "Falha ao buscar poder por ID.", { originalError: error.message });
        }
    }

    // --- Atualiza um poder existente ---
    async updatePoder(idPoder, dadosPoder) {
        console.log("🟢 PoderService.updatePoder() - ID:", idPoder, "Novos dados:", dadosPoder);
        try {
            const poderExistente = await this.#poderDAO.findById(idPoder);
            if (!poderExistente) {
                throw new ErrorResponse(404, "Poder não encontrado para atualização.", { message: `Poder com ID ${idPoder} não foi encontrado para atualização.` });
            }

            const poderParaAtualizarValidado = new Poder({ ...dadosPoder, idPoder: idPoder });
            
            const sucessoAtualizacao = await this.#poderDAO.update(poderParaAtualizarValidado);
            
            if (!sucessoAtualizacao) {
                throw new ErrorResponse(400, "Nenhuma alteração detectada ou falha ao atualizar poder.");
            }
            
            const poderAtualizadoData = await this.#poderDAO.findById(idPoder);
            if (!poderAtualizadoData) {
                throw new ErrorResponse(500, "Erro interno: Poder atualizado, mas não recuperável.");
            }
            return poderAtualizadoData;
        } catch (error) {
            console.error("ERRO em PoderService.updatePoder:", error.message, "ID:", idPoder, "Dados:", dadosPoder);
            if (error instanceof ErrorResponse) throw error;
            throw new ErrorResponse(400, "Falha ao atualizar poder: " + error.message, { originalError: error.message });
        }
    }

    // --- Exclui um poder ---
    async deletePoder(idPoder) {
        console.log("🟢 PoderService.deletePoder() - Excluindo ID:", idPoder);
        try {
            const poderExistente = await this.#poderDAO.findById(idPoder);
            if (!poderExistente) {
                throw new ErrorResponse(404, "Poder não encontrado para exclusão.", { message: `Poder com ID ${idPoder} não foi encontrado para exclusão.` });
            }
            
            const sucessoExclusao = await this.#poderDAO.delete(idPoder);

            if (!sucessoExclusao) {
                throw new ErrorResponse(500, "Falha ao excluir poder: nenhuma linha afetada.");
            }
            return true;
        } catch (error) {
            console.error("ERRO em PoderService.deletePoder:", error.message, "ID:", idPoder);
            if (error instanceof ErrorResponse) throw error;
            throw new ErrorResponse(500, "Falha ao excluir poder.", { originalError: error.message });
        }
    }
};