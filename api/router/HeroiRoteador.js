const express = require("express");
const HeroiMiddleware = require("../middleware/HeroiMiddleware"); // Importa a CLASSE
const HeroiControl = require("../control/HeroiControl"); // Ajuste o caminho se necessário
const JwtMiddleware = require("../middleware/JwtMiddleware"); // Importa a CLASSE

module.exports = class HeroiRoteador {
    #router;
    #heroiControl;
    // REMOVA: #heroiMiddleware; // Não precisa mais armazenar se for usar estaticamente

    /**
     * Construtor da classe HeroiRoteador
     *
     * @param {HeroiControl} heroiControlDependency - Instância do HeroiControl injetada
     */
    constructor(heroiControlDependency) { // REMOVA heroiMiddlewareDependency do construtor
        console.log("⬆️  HeroiRoteador.constructor()");
        this.#router = express.Router();

        this.#heroiControl = heroiControlDependency;
    }

    createRoutes = () => {
        console.log("⬆️  HeroiRoteador.createRoutes()");

        this.#router.post("/",
            JwtMiddleware.authorize(['admin']),
            HeroiMiddleware.validateHeroiBody, 
            this.#heroiControl.store
        );

        this.#router.put("/:idHeroi",
            JwtMiddleware.authorize(['admin']),
            HeroiMiddleware.validateIdParam, 
            HeroiMiddleware.validateHeroiBody, 
            this.#heroiControl.update
        );

        this.#router.delete("/:idHeroi",
            JwtMiddleware.authorize(['admin']),
            HeroiMiddleware.validateIdParam, 
            this.#heroiControl.destroy
        );

        this.#router.get("/",
            this.#heroiControl.index
        );

        this.#router.get("/:idHeroi",
            HeroiMiddleware.validateIdParam,
            this.#heroiControl.show
        );

        return this.#router;
    };
};