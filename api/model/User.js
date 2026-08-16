// api/model/User.js
module.exports = class User {
    #id;
    #username;
    #email;
    #passwordHash; // Para armazenar o hash da senha
    #role;
    #createdAt;

    get id() { return this.#id; }
    set id(value) { this.#id = value; }

    get username() { return this.#username; }
    set username(value) {
        if (!value || typeof value !== 'string' || value.length < 3) {
            throw new Error("Nome de usuário inválido.");
        }
        this.#username = value;
    }

    get email() { return this.#email; }
    set email(value) {
        if (!value || typeof value !== 'string' || !value.includes('@')) {
            throw new Error("Email inválido.");
        }
        this.#email = value;
    }

    get passwordHash() { return this.#passwordHash; }
    set passwordHash(value) {
        if (!value || typeof value !== 'string') {
            throw new Error("Hash de senha inválido.");
        }
        this.#passwordHash = value;
    }

    get role() { return this.#role; }
    set role(value) {
        if (!['user', 'admin'].includes(value)) { // Exemplo de validação de role
            throw new Error("Role inválida.");
        }
        this.#role = value;
    }

    get createdAt() { return this.#createdAt; }
    set createdAt(value) { this.#createdAt = value; }
};