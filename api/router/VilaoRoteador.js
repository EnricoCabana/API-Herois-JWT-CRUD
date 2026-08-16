const express = require("express");
const VilaoMiddleware = require("../middleware/VilaoMiddleware"); // Importa a CLASSE
const VilaoControl = require("../control/VilaoControl"); // Ajuste o caminho se necessário
const JwtMiddleware = require("../middleware/JwtMiddleware"); // Importa a CLASSE

module.exports = class VilaoRoteador {
    #router;
    #vilaoControl;
    // REMOVA: #vilaoMiddleware; // Não precisa mais armazenar se for usar estaticamente

    /**
     * Construtor da classe VilaoRoteador
     *
     * @param {VilaoControl} vilaoControlDependency - Instância do VilaoControl injetada
     */
    constructor(vilaoControlDependency) { // REMOVA vilaoMiddlewareDependency do construtor
        console.log("⬆️  VilaoRoteador.constructor()");
        this.#router = express.Router();

        this.#vilaoControl = vilaoControlDependency;
    }

    createRoutes = () => {
        console.log("⬆️  VilaoRoteador.createRoutes()");

        this.#router.post("/",
            JwtMiddleware.authorize(['admin']),
            VilaoMiddleware.validateVilaoBody,
            this.#vilaoControl.store
        );

        this.#router.put("/:idVilao",
            JwtMiddleware.authorize(['admin']),
            VilaoMiddleware.validateIdParam,
            VilaoMiddleware.validateVilaoBody,
            this.#vilaoControl.update
        );

        this.#router.delete("/:idVilao",
            JwtMiddleware.authorize(['admin']),
            VilaoMiddleware.validateIdParam,
            this.#vilaoControl.destroy
        );

        this.#router.get("/",
            this.#vilaoControl.index
        );

        this.#router.get("/:idVilao",
            VilaoMiddleware.validateIdParam,
            this.#vilaoControl.show
        );

        return this.#router;
    };
};