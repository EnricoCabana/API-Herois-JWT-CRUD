// api/model/Heroi.js
/**
 * Representa a entidade Heroi do universo de heróis.
 * ...
 */
const Poder = require("./Poder"); // Importe o modelo Poder, será útil no futuro, por enquanto o POJO é suficiente.

module.exports = class Heroi {

    #idHeroi;
    #nomeHeroi;
    #identidadeSecreta;
    #poder;

    /**
     * Construtor da classe Heroi.
     * @param {Object} [dados={}] - Objeto contendo os dados do herói.
     * @param {number} [dados.idHeroi] - ID do herói (opcional).
     * @param {string} [dados.nomeHeroi] - Nome do herói.
     * @param {string} [dados.identidadeSecreta] - Identidade secreta do herói (opcional).
     * @param {Object | null} [dados.poder] - Objeto POJO de Poder ou null (vindo do DAO, completo).
     * @param {number | null} [dados.Poderes_idPoder] - ID da chave estrangeira do poder (vindo da requisição).
     */
    constructor(dados = {}) {
        console.log("⬆️  Heroi.constructor() - Dados recebidos para inicialização:", dados);

        this.idHeroi = dados.idHeroi;
        this.nomeHeroi = dados.nomeHeroi;
        this.identidadeSecreta = dados.identidadeSecreta;

        // --- LÓGICA DE POPULAR #poder ---
        if (dados.poder !== undefined && dados.poder !== null) {
            // Caso venha um objeto 'poder' completo (do DAO, por exemplo)
            this.poder = dados.poder;
        } else if (dados.Poderes_idPoder !== undefined && dados.Poderes_idPoder !== null) {
            // Caso venha apenas o ID da FK (da requisição HTTP POST/PUT)
            this.poder = { idPoder: dados.Poderes_idPoder };
        } else {
            // Caso nenhuma informação de poder seja fornecida
            this.#poder = null;
        }

        console.log("⬆️  Heroi.constructor() - Estado interno após inicialização:", {
            idHeroi: this.#idHeroi,
            nomeHeroi: this.#nomeHeroi,
            identidadeSecreta: this.#identidadeSecreta,
            poder: this.#poder // Este será um POJO ou null
        });
    }

    // --- GETTERS E SETTERS ---

    get idHeroi() { return this.#idHeroi; }
    set idHeroi(valor) {
        if (valor === undefined || valor === null) {
            this.#idHeroi = null; // ID pode ser null para nova criação
            return;
        }
        const parsed = Number(valor);
        if (isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
            throw new Error(`idHeroi deve ser um número inteiro positivo. Recebido: '${valor}'`);
        }
        this.#idHeroi = parsed;
    }

    get nomeHeroi() { return this.#nomeHeroi; }
    set nomeHeroi(value) {
        if (value === undefined || value === null) {
            throw new Error("nomeHeroi é obrigatório e não pode ser nulo ou indefinido.");
        }
        if (typeof value !== "string") {
            throw new Error(`nomeHeroi deve ser uma string. Recebido: '${typeof value}'`);
        }
        const nome = value.trim();
        if (nome.length < 3) {
            throw new Error(`nomeHeroi deve ter pelo menos 3 caracteres. Recebido (${nome.length}): '${nome}'`);
        }
        if (nome.length > 100) {
            throw new Error(`nomeHeroi deve ter no máximo 100 caracteres. Recebido (${nome.length}): '${nome}'`);
        }
        this.#nomeHeroi = nome;
    }

    get identidadeSecreta() { return this.#identidadeSecreta; }
    set identidadeSecreta(value) {
        if (value === null || value === undefined) {
            this.#identidadeSecreta = null;
            return;
        }
        if (typeof value !== "string") {
            throw new Error(`identidadeSecreta deve ser uma string ou nulo. Recebido: '${typeof value}'`);
        }
        const trimmedValue = value.trim();
        if (trimmedValue.length === 0) {
            this.#identidadeSecreta = null;
            return;
        }
        this.#identidadeSecreta = trimmedValue;
    }

    get poder() {
        return this.#poder;
    }

    set poder(value) {
        console.log("Heroi.set poder - Recebendo valor para setar:", value);
        if (value === null || value === undefined) {
            this.#poder = null;
            return;
        }
        // Deve ser um objeto e ter no mínimo o idPoder
        if (typeof value === 'object' && value.idPoder !== undefined && Number.isInteger(value.idPoder) && value.idPoder > 0) {
            // Cria um POJO de poder. Se vier completo (do DAO), ele terá nomePoder e descricao.
            // Se vier apenas com { idPoder: 1 } (da requisição), nomePoder e descricao serão null.
            this.#poder = {
                idPoder: value.idPoder,
                nomePoder: value.nomePoder || null,
                descricao: value.descricao || null
            };
        } else {
            console.error("ERRO: Valor inesperado para 'Heroi.set poder'. Esperava um POJO de Poder com 'idPoder' válido ou null. Recebido:", value);
            this.#poder = null;
        }
    }

    // Retorna apenas o ID do poder para ser usado como FK no banco
    getPoderId() {
        return this.#poder ? this.#poder.idPoder : null;
    }

    /**
     * Converte o objeto Heroi para um formato que pode ser serializado para JSON.
     * @returns {Object} Representação do herói para JSON (POJO).
     */
    toJson() {
        console.log("Heroi.toJson() - Gerando JSON para herói:", this.nomeHeroi, "Poder:", this.#poder);
        return {
            idHeroi: this.idHeroi,
            nomeHeroi: this.nomeHeroi,
            identidadeSecreta: this.identidadeSecreta,
            // Mantendo Poderes_idPoder para clareza da FK, mas o 'poder' aninhado é o principal.
            Poderes_idPoder: this.getPoderId(), 
            poder: this.#poder // Este será um POJO completo ou null, conforme montado pelo DAO ou entrada
        };
    }
}