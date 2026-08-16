// api/model/Poder.js

/**
 * Representa a entidade Poder do sistema (Superpoderes de Heróis/Vilões).
 *
 * Objetivo:
 * - Encapsular os dados de um poder.
 * - Garantir integridade dos atributos via getters e setters.
 * - Fornecer métodos para serialização/desserialização.
 */
module.exports = class Poder {
    // Atributos privados inicializados com null ou undefined
    #idPoder;
    #nomePoder;
    #descricao;

    /**
     * Construtor da classe Poder.
     * Permite inicializar um poder com um objeto de dados.
     * @param {Object} [dados={}] - Objeto contendo os dados do poder (opcional).
     * @param {number} [dados.idPoder] - ID do poder.
     * @param {string} [dados.nomePoder] - Nome do poder.
     * @param {string} [dados.descricao] - Descrição do poder (opcional, pode ser null).
     */
    constructor(dados = {}) {
        console.log("⬆️  Poder.constructor() - Dados recebidos para inicialização:", dados); // Log detalhado

        // Atribui os valores usando os setters para garantir a validação.
        // A ordem pode importar para algumas validações, mas aqui não é crítico.
        try {
            // Verifica e atribui ID
            if (dados.idPoder !== undefined) {
                this.idPoder = dados.idPoder;
            }

            // Verifica e atribui Nome
            if (dados.nomePoder !== undefined) {
                this.nomePoder = dados.nomePoder;
            }

            // Verifica e atribui Descrição (pode ser undefined, null ou string)
            // Se 'descricao' não estiver presente em 'dados', o setter será ignorado,
            // e '#descricao' permanecerá undefined ou null (dependendo da inicialização).
            // Se estiver presente, o setter fará a validação.
            if (dados.descricao !== undefined) {
                this.descricao = dados.descricao;
            } else {
                // Garante que a descrição seja null se não for fornecida.
                this.#descricao = null;
            }

        } catch (error) {
            console.error("ERRO no construtor de Poder durante atribuição:", error.message, "Dados:", dados);
            // Re-throw o erro para que o erro seja propagado e a criação do objeto falhe.
            throw error;
        }
    }

    // --- GETTERS E SETTERS ---

    /**
     * Getter para idPoder
     * @returns {number} Identificador único do poder
     */
    get idPoder() {
        return this.#idPoder;
    }

    /**
     * Define o ID do poder.
     *
     * 🔹 Regra de domínio: garante que o ID seja sempre um número inteiro positivo.
     *
     * @param {number} value - Número inteiro positivo representando o ID do poder.
     * @throws {Error} - Lança erro se o valor não for número, não for inteiro ou for menor/igual a zero.
     */
    set idPoder(value) {
        // Validação mais rigorosa para 'value' antes de converter
        if (value === undefined || value === null) {
            throw new Error("idPoder é obrigatório e não pode ser nulo ou indefinido.");
        }
        
        const parsed = Number(value);

        if (isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
            throw new Error(`idPoder deve ser um número inteiro positivo. Recebido: '${value}'`);
        }
        this.#idPoder = parsed;
    }

    /**
     * Getter para nomePoder
     * @returns {string} Nome do poder
     */
    get nomePoder() {
        return this.#nomePoder;
    }

    /**
     * Define o nome do poder.
     *
     * 🔹 Regra de domínio: garante que o nome seja sempre uma string não vazia
     * e com pelo menos 3 caracteres e no máximo 100 caracteres.
     *
     * @param {string} value - Nome do poder.
     * @throws {Error} - Lança erro se o valor não for string, estiver vazio, tiver menos de 3 caracteres, mais de 100 caracteres ou for null/undefined.
     */
    set nomePoder(value) {
        if (value === undefined || value === null) {
            throw new Error("nomePoder é obrigatório e não pode ser nulo ou indefinido.");
        }
        if (typeof value !== "string") {
            throw new Error(`nomePoder deve ser uma string. Recebido: '${typeof value}'`);
        }
        const nome = value.trim();
        if (nome.length < 3) {
            throw new Error(`nomePoder deve ter pelo menos 3 caracteres. Recebido (${nome.length}): '${nome}'`);
        }
        if (nome.length > 100) {
            throw new Error(`nomePoder deve ter no máximo 100 caracteres. Recebido (${nome.length}): '${nome}'`);
        }
        this.#nomePoder = nome;
    }

    /**
     * Getter para descricao
     * @returns {string | null} Descrição do poder
     */
    get descricao() {
        return this.#descricao;
    }

    /**
     * Define a descrição do poder.
     *
     * 🔹 Regra de domínio: deve ser uma string não vazia ou null.
     *
     * @param {string | null | undefined} value - Descrição do poder.
     * @throws {Error} - Lança erro se o valor não for string, null ou se for uma string vazia.
     */
    set descricao(value) {
        // Aceita null ou undefined explicitamente
        if (value === null || value === undefined) {
            this.#descricao = null;
            return;
        }
        if (typeof value !== "string") {
            throw new Error(`descricao deve ser uma string ou null. Recebido: '${typeof value}'`);
        }
        const desc = value.trim();
        if (desc.length === 0) {
            // Se uma string vazia for fornecida, podemos tratá-la como null ou lançar um erro.
            // Para ser flexível, vamos definir como null se for uma string vazia após trim.
            this.#descricao = null; // Ou throw new Error("descricao não pode ser uma string vazia.");
            return;
        }
        this.#descricao = desc;
    }

    /**
     * Converte o objeto Poder para um formato que pode ser serializado para JSON,
     * útil para respostas da API.
     * @returns {Object} Representação do poder para JSON (POJO).
     */
    toJson() {
        // Retorna um objeto literal com as propriedades públicas (acessando via getters)
        return {
            idPoder: this.idPoder,
            nomePoder: this.nomePoder,
            descricao: this.descricao
        };
    }

    /**
     * Método estático para criar uma instância de Poder a partir de um objeto JavaScript puro (POJO).
     * @param {Object} json - Objeto POJO contendo os dados do poder.
     * @returns {Poder | null} Nova instância de Poder ou null se os dados forem inválidos/ausentes.
     */
    static fromJson(json) {
        if (!json || typeof json !== 'object') { // Não exige idPoder aqui para o fromJson, pois pode ser uma criação nova
            console.warn("Poder.fromJson: Dados inválidos ou ausentes.", json);
            return null;
        }
        try {
            return new Poder(json); // Usa o construtor, que fará a validação
        } catch (error) {
            console.error("ERRO ao criar Poder de JSON:", error.message, "JSON:", json);
            return null;
        }
    }
};