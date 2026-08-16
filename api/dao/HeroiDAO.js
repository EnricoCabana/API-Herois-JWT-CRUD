// api/dao/HeroiDAO.js
const Heroi = require("../model/Heroi");
const Poder = require("../model/Poder");
const MysqlDatabase = require("../database/MysqlDatabase");

module.exports = class HeroiDAO {
    #database;

    constructor(databaseInstance) {
        console.log("⬆️  HeroiDAO.constructor()");
        this.#database = databaseInstance;
    }

    create = async (objHeroiModel) => {
        console.log("🟢 HeroiDAO.create()");
        const SQL = `
            INSERT INTO Herois
            (nomeHeroi, identidadeSecreta, Poderes_idPoder)
            VALUES (?, ?, ?);`;
        const params = [
            objHeroiModel.nomeHeroi,
            objHeroiModel.identidadeSecreta,
            objHeroiModel.getPoderId(),
        ];
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);
        if (!resultado.insertId) {
            throw new Error("Falha ao inserir herói.");
        }
        return resultado.insertId;
    };

    delete = async (idHeroi) => {
        console.log("🟢 HeroiDAO.delete()");
        const SQL = "DELETE FROM Herois WHERE idHeroi = ?;";
        const params = [idHeroi];
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);
        return resultado.affectedRows > 0;
    };

    update = async (objHeroiModel) => {
        console.log("🟢 HeroiDAO.update()");
        const SQL = `
            UPDATE Herois
            SET nomeHeroi=?, identidadeSecreta=?, Poderes_idPoder=?
            WHERE idHeroi=?;`;
        const params = [
            objHeroiModel.nomeHeroi,
            objHeroiModel.identidadeSecreta,
            objHeroiModel.getPoderId(), // objHeroiModel AQUI É UMA INSTÂNCIA DE Heroi
            objHeroiModel.idHeroi,
        ];
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);
        return resultado.affectedRows > 0;
    };

    findAll = async () => {
        console.log("🟢 HeroiDAO.findAll()");
        const SQL = `
            SELECT
                H.idHeroi,
                H.nomeHeroi,
                H.identidadeSecreta,
                H.Poderes_idPoder,
                P.idPoder AS poder_idPoder,
                P.nomePoder,
                P.descricao AS poderDescricao
            FROM Herois AS H
            LEFT JOIN Poderes AS P ON H.Poderes_idPoder = P.idPoder;`;
        const pool = await this.#database.getPool();
        const [matrizDados] = await pool.execute(SQL);

        console.log("HeroiDAO.findAll - Dados brutos da query SQL:", matrizDados);

        return matrizDados.map(row => {
            let poderPojo = null; // Variável para o POJO de Poder

            if (row.poder_idPoder !== null) {
                try {
                    // CORREÇÃO AQUI: Monta o POJO do poder diretamente
                    poderPojo = {
                        idPoder: row.poder_idPoder,
                        nomePoder: row.nomePoder,
                        descricao: row.poderDescricao,
                    };
                    console.log(`HeroiDAO.findAll - Poder POJO preparado para herói ID ${row.idHeroi}:`, poderPojo);
                } catch (error) {
                    console.error(`HeroiDAO.findAll - ERRO ao criar POJO Poder para herói ID ${row.idHeroi}:`, error.message);
                    poderPojo = null;
                }
            } else {
                 console.log(`HeroiDAO.findAll - Nenhum poder encontrado para herói ID ${row.idHeroi}.`);
            }

            // CORREÇÃO CRÍTICA AQUI: Retorna um POJO para o herói, NÃO uma instância de Heroi
            return {
                idHeroi: row.idHeroi,
                nomeHeroi: row.nomeHeroi,
                identidadeSecreta: row.identidadeSecreta,
                poder: poderPojo // Já é um POJO ou null
            };
        });
    };

    findById = async (idHeroi) => {
        console.log("🟢 HeroiDAO.findById()");
        const SQL = `
            SELECT
                H.idHeroi,
                H.nomeHeroi,
                H.identidadeSecreta,
                H.Poderes_idPoder,
                P.idPoder AS poder_idPoder,
                P.nomePoder,
                P.descricao AS poderDescricao
            FROM Herois AS H
            LEFT JOIN Poderes AS P ON H.Poderes_idPoder = P.idPoder
            WHERE H.idHeroi = ?;`;
        const params = [idHeroi];
        const pool = await this.#database.getPool();
        const [rows] = await pool.execute(SQL, params);

        if (rows.length === 0) {
            return null;
        }

        const row = rows[0];
        let poderPojo = null; // Variável para o POJO de Poder

        if (row.poder_idPoder !== null) {
            try {
                // CORREÇÃO AQUI: Monta o POJO do poder diretamente
                poderPojo = {
                    idPoder: row.poder_idPoder,
                    nomePoder: row.nomePoder,
                    descricao: row.poderDescricao,
                };
                console.log(`HeroiDAO.findById - Poder POJO preparado para herói ID ${row.idHeroi}:`, poderPojo);
            } catch (error) {
                console.error(`HeroiDAO.findById - ERRO ao criar POJO Poder para herói ID ${row.idHeroi}:`, error.message);
                poderPojo = null;
            }
        } else {
            console.log(`HeroiDAO.findById - Nenhum poder encontrado para herói ID ${row.idHeroi}.`);
        }

        return {
            idHeroi: row.idHeroi,
            nomeHeroi: row.nomeHeroi,
            identidadeSecreta: row.identidadeSecreta,
            poder: poderPojo
        };
    };

    findByField = async (field, value) => {
        console.log(`🟢 HeroiDAO.findByField() - Campo: ${field}, Valor: ${value}`);
        const allowedFields = ["idHeroi", "nomeHeroi", "identidadeSecreta", "Poderes_idPoder"];
        if (!allowedFields.includes(field)) {
            throw new Error("Campo inválido para busca de herói.");
        }
        const SQL = `
            SELECT
                H.idHeroi,
                H.nomeHeroi,
                H.identidadeSecreta,
                H.Poderes_idPoder,
                P.idPoder AS poder_idPoder,
                P.nomePoder,
                P.descricao AS poderDescricao
            FROM Herois AS H
            LEFT JOIN Poderes AS P ON H.Poderes_idPoder = P.idPoder
            WHERE H.${field} = ?;`;
        const params = [value];
        const pool = await this.#database.getPool();
        const [rows] = await pool.execute(SQL, params);

        return rows.map(row => {
            let poderPojo = null; // Variável para o POJO de Poder

            if (row.poder_idPoder !== null) {
                try {
                    // CORREÇÃO AQUI: Monta o POJO do poder diretamente
                    poderPojo = {
                        idPoder: row.poder_idPoder,
                        nomePoder: row.nomePoder,
                        descricao: row.poderDescricao,
                    };
                    console.log(`HeroiDAO.findByField - Poder POJO preparado para herói ID ${row.idHeroi}:`, poderPojo);
                } catch (error) {
                    console.error(`HeroiDAO.findByField - ERRO ao criar POJO Poder para herói ID ${row.idHeroi}:`, error.message);
                    poderPojo = null;
                }
            } else {
                 console.log(`HeroiDAO.findByField - Nenhum poder encontrado para herói ID ${row.idHeroi}.`);
            }
            return {
                idHeroi: row.idHeroi,
                nomeHeroi: row.nomeHeroi,
                identidadeSecreta: row.identidadeSecreta,
                poder: poderPojo
            };
        });
    };
};