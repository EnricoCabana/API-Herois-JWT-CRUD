// api/model/Role.js - Exemplo, se você tiver uma entidade Role separada
module.exports = class Role {
    #idRole;
    #nameRole;

    get idRole() { return this.#idRole; }
    set idRole(value) { this.#idRole = value; }

    get nameRole() { return this.#nameRole; }
    set nameRole(value) { this.#nameRole = value; }
};