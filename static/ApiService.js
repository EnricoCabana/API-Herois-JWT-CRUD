export default class ApiService {
    #token;

    constructor(token = null) {
        this.#token = token;
    }

    // Método auxiliar para lidar com respostas HTTP
    async #handleResponse(response, uri, method) {
        // Se a resposta não foi OK (status 2xx), tentamos ler o JSON de erro
        if (!response.ok) {
            let errorJson = null;
            try {
                errorJson = await response.json(); // Tenta ler o JSON de erro
            } catch (jsonError) {
                // Se não conseguir ler o JSON, o corpo pode estar vazio ou malformado
                console.warn(`Erro ao parsear JSON de erro para ${method} ${uri}:`, jsonError);
            }

            console.error(`${method}: ${uri} - Erro HTTP ${response.status}`, errorJson);
            // Lança um erro personalizado que inclui o status HTTP e o corpo do erro (se existir)
            const error = new Error(errorJson?.message || `Erro HTTP: ${response.status} ${response.statusText}`);
            error.status = response.status;
            error.responseBody = errorJson; // Anexa o corpo da resposta de erro para mais detalhes
            throw error;
        }

        // Se a resposta foi OK (status 2xx), tentamos ler o JSON de sucesso
        let jsonObj = null;
        try {
            // Verifica se há conteúdo para ser lido como JSON (evita erros em 204 No Content)
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                jsonObj = await response.json();
            } else if (response.status === 204) {
                // Se 204 No Content, criamos um objeto de sucesso padrão
                jsonObj = { success: true, message: "Operação realizada com sucesso (No Content)." };
            }
        } catch (jsonError) {
            console.warn(`${method}: ${uri} - Resposta OK, mas falha ao parsear JSON.`, jsonError);
            // Se falhou ao parsear JSON mas status é OK, assume sucesso básico
            jsonObj = { success: true, message: "Operação realizada com sucesso, mas resposta JSON vazia/inválida." };
        }

        console.log(`${method}: ${uri}`, jsonObj);
        return jsonObj;
    }


    // Métodos GET, POST, PUT, DELETE agora usam #handleResponse
    async get(uri) {
        try {
            const headers = { "Content-Type": "application/json" };
            if (this.#token) headers["Authorization"] = `Bearer ${this.#token}`;

            const response = await fetch(uri, { method: "GET", headers: headers });
            return await this.#handleResponse(response, uri, "GET");
        } catch (error) {
            console.error("Erro na requisição GET:", error.message, error.responseBody);
            throw error; // Re-lança o erro para ser tratado no componente
        }
    }

    async getById(uri, id) {
        try {
            const headers = { "Content-Type": "application/json" };
            if (this.#token) headers["Authorization"] = `Bearer ${this.#token}`;
            const fullUri = `${uri}/${id}`;

            const response = await fetch(fullUri, { method: "GET", headers: headers });
            return await this.#handleResponse(response, fullUri, "GET BY ID");
        } catch (error) {
            console.error("Erro na requisição GET BY ID:", error.message, error.responseBody);
            throw error;
        }
    }

    async post(uri, jsonObject) {
        try {
            const headers = { "Content-Type": "application/json" };
            if (this.#token) headers["Authorization"] = `Bearer ${this.#token}`;

            const response = await fetch(uri, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(jsonObject)
            });
            return await this.#handleResponse(response, uri, "POST");
        } catch (error) {
            console.error("Erro na requisição POST:", error.message, error.responseBody);
            throw error;
        }
    }

    async put(uri, id, jsonObject) {
        try {
            const headers = { "Content-Type": "application/json" };
            if (this.#token) headers["Authorization"] = `Bearer ${this.#token}`;
            const fullUri = `${uri}/${id}`;

            const response = await fetch(fullUri, {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(jsonObject)
            });
            return await this.#handleResponse(response, fullUri, "PUT");
        } catch (error) {
            console.error("Erro na requisição PUT:", error.message, error.responseBody);
            throw error;
        }
    }

    async delete(uri, id) {
        try {
            const headers = { "Content-Type": "application/json" };
            if (this.#token) headers["Authorization"] = `Bearer ${this.#token}`;
            const fullUri = `${uri}/${id}`;

            const response = await fetch(fullUri, { method: "DELETE", headers: headers });
            return await this.#handleResponse(response, fullUri, "DELETE");
        } catch (error) {
            console.error("Erro na requisição DELETE:", error.message, error.responseBody);
            throw error;
        }
    }

    /**
     * Getter para o token privado.
     * @returns {string|null} Retorna o token atual.
     */
    get token() {
        return this.#token;
    }

    /**
     * Setter para atualizar o token privado.
     * @param {string} value - Novo token a ser setado.
     */
    set token(value) {
        this.#token = value;
    }
}
