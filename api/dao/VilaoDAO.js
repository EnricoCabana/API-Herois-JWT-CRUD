// api/dao/VilaoDAO.js
const Vilao = require("../model/Vilao"); // Ainda precisamos para getPoderId no create/update, mas não para retornar
const Poder = require("../model/Poder"); // Ainda precisamos para instanciar (temporariamente) e usar toJson
const MysqlDatabase = require("../database/MysqlDatabase");

module.exports = class VilaoDAO {
    #database;

    constructor(databaseInstance) {
        console.log("⬆️  VilaoDAO.constructor()");
        this.#database = databaseInstance;
    }

    create = async (objVilaoModel) => {
        console.log("🟢 VilaoDAO.create()");
        const SQL = `
            INSERT INTO Viloes
            (nomeVilao, identidadeSecreta, Poderes_idPoder)
            VALUES (?, ?, ?);`;
        const params = [
            objVilaoModel.nomeVilao,
            objVilaoModel.identidadeSecreta,
            objVilaoModel.getPoderId(), // objVilaoModel AQUI É UMA INSTÂNCIA DE Vilao, por isso getPoderId() funciona
        ];
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);
        if (!resultado.insertId) {
            throw new Error("Falha ao inserir vilão.");
        }
        return resultado.insertId;
    };

    delete = async (idVilao) => {
        console.log("🟢 VilaoDAO.delete()");
        const SQL = "DELETE FROM Viloes WHERE idVilao = ?;";
        const params = [idVilao];
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);
        return resultado.affectedRows > 0;
    };

    update = async (objVilaoModel) => {
        console.log("🟢 VilaoDAO.update()");
        const SQL = `
            UPDATE Viloes
            SET nomeVilao=?, identidadeSecreta=?, Poderes_idPoder=?
            WHERE idVilao=?;`;
        const params = [
            objVilaoModel.nomeVilao,
            objVilaoModel.identidadeSecreta,
            objVilaoModel.getPoderId(), // objVilaoModel AQUI É UMA INSTÂNCIA DE Vilao
            objVilaoModel.idVilao,
        ];
        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);
        return resultado.affectedRows > 0;
    };

    findAll = async () => {
        console.log("🟢 VilaoDAO.findAll()");
        const SQL = `
            SELECT
                H.idVilao,
                H.nomeVilao,
                H.identidadeSecreta,
                H.Poderes_idPoder,
                P.idPoder AS poder_idPoder,
                P.nomePoder,
                P.descricao AS poderDescricao
            FROM Viloes AS H
            LEFT JOIN Poderes AS P ON H.Poderes_idPoder = P.idPoder;`;
        const pool = await this.#database.getPool();
        const [matrizDados] = await pool.execute(SQL);

        console.log("VilaoDAO.findAll - Dados brutos da query SQL:", matrizDados);

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
                    console.log(`VilaoDAO.findAll - Poder POJO preparado para vilão ID ${row.idVilao}:`, poderPojo);
                } catch (error) {
                    console.error(`VilaoDAO.findAll - ERRO ao criar POJO Poder para vilão ID ${row.idVilao}:`, error.message);
                    poderPojo = null;
                }
            } else {
                 console.log(`VilaoDAO.findAll - Nenhum poder encontrado para vilão ID ${row.idVilao}.`);
            }

            // CORREÇÃO CRÍTICA AQUI: Retorna um POJO para o vilão, NÃO uma instância de Vilao
            return {
                idVilao: row.idVilao,
                nomeVilao: row.nomeVilao,
                identidadeSecreta: row.identidadeSecreta,
                poder: poderPojo // Já é um POJO ou null
            };
        });
    };

    findById = async (idVilao) => {
        console.log("🟢 VilaoDAO.findById()");
        const SQL = `
            SELECT
                H.idVilao,
                H.nomeVilao,
                H.identidadeSecreta,
                H.Poderes_idPoder,
                P.idPoder AS poder_idPoder,
                P.nomePoder,
                P.descricao AS poderDescricao
            FROM Viloes AS H
            LEFT JOIN Poderes AS P ON H.Poderes_idPoder = P.idPoder
            WHERE H.idVilao = ?;`;
        const params = [idVilao];
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
                console.log(`VilaoDAO.findById - Poder POJO preparado para vilão ID ${row.idVilao}:`, poderPojo);
            } catch (error) {
                console.error(`VilaoDAO.findById - ERRO ao criar POJO Poder para vilão ID ${row.idVilao}:`, error.message);
                poderPojo = null;
            }
        } else {
            console.log(`VilaoDAO.findById - Nenhum poder encontrado para vilão ID ${row.idVilao}.`);
        }

        // CORREÇÃO CRÍTICA AQUI: Retorna um POJO para o vilão, NÃO uma instância de Vilao
        return {
            idVilao: row.idVilao,
            nomeVilao: row.nomeVilao,
            identidadeSecreta: row.identidadeSecreta,
            poder: poderPojo // Já é um POJO ou null
        };
    };

    findByField = async (field, value) => {
        console.log(`🟢 VilaoDAO.findByField() - Campo: ${field}, Valor: ${value}`);
        const allowedFields = ["idVilao", "nomeVilao", "identidadeSecreta", "Poderes_idPoder"];
        if (!allowedFields.includes(field)) {
            throw new Error("Campo inválido para busca de vilão.");
        }
        const SQL = `
            SELECT
                H.idVilao,
                H.nomeVilao,
                H.identidadeSecreta,
                H.Poderes_idPoder,
                P.idPoder AS poder_idPoder,
                P.nomePoder,
                P.descricao AS poderDescricao
            FROM Viloes AS H
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
                    console.log(`VilaoDAO.findByField - Poder POJO preparado para vilão ID ${row.idVilao}:`, poderPojo);
                } catch (error) {
                    console.error(`VilaoDAO.findByField - ERRO ao criar POJO Poder para vilão ID ${row.idVilao}:`, error.message);
                    poderPojo = null;
                }
            } else {
                 console.log(`VilaoDAO.findByField - Nenhum poder encontrado para vilão ID ${row.idVilao}.`);
            }
            // CORREÇÃO CRÍTICA AQUI: Retorna um POJO para o vilão, NÃO uma instância de Vilao
            return {
                idVilao: row.idVilao,
                nomeVilao: row.nomeVilao,
                identidadeSecreta: row.identidadeSecreta,
                poder: poderPojo // Já é um POJO ou null
            };
        });
    };
};