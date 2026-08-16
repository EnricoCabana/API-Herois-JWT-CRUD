const express = require("express");
const PoderMiddleware = require("../middleware/PoderMiddleware"); // Importa a CLASSE
const PoderControl = require("../control/PoderControl"); // Importa a CLASSE (caminho ajustado)
const JwtMiddleware = require("../middleware/JwtMiddleware");

module.exports = class PoderRoteador {
    #router;
    #poderControl; // Armazenará a INSTÂNCIA do PoderControl

    // O construtor espera APENAS a instância do PoderControl
    constructor(poderControlDependency) {
        console.log("⬆️  PoderRoteador.constructor()");
        this.#router = express.Router();
        this.#poderControl = poderControlDependency; // Armazena a instância
    }

    createRoutes() {
        console.log("⬆️  PoderRoteador.createRoutes()");

        // ROTA: POST[/poderes]
        this.#router.post("/",
            JwtMiddleware.authorize(['admin']),
            PoderMiddleware.validatePoderData,
            this.#poderControl.store
        );

        // ROTA: PUT[/poderes/:idPoder]
        this.#router.put("/:idPoder",
            JwtMiddleware.authorize(['admin']),
            PoderMiddleware.validateIdParam,
            PoderMiddleware.validatePoderData,
            this.#poderControl.update
        );

        // ROTA: DELETE[/poderes/:idPoder]
        this.#router.delete("/:idPoder",
            JwtMiddleware.authorize(['admin']),
            PoderMiddleware.validateIdParam,
            this.#poderControl.destroy
        );

        // ROTA: GET[/poderes]
        this.#router.get("/",
            this.#poderControl.index
        );

        // ROTA: GET[/poderes/:idPoder]
        this.#router.get("/:idPoder",
            PoderMiddleware.validateIdParam,
            this.#poderControl.show
        );

        return this.#router;
    }
};