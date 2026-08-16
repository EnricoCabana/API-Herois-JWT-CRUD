// api/dao/PoderDAO.js
const Poder = require("../model/Poder"); // Apenas necessário para `create` e `update` para obter os dados já validados.
const MysqlDatabase = require("../database/MysqlDatabase");

module.exports = class PoderDAO {
    #database;

    constructor(databaseInstance) {
        console.log("⬆️  PoderDAO.constructor()");
        this.#database = databaseInstance;
    }

    create = async (objPoderModel) => {
        console.log("🟢 PoderDAO.create()");
        // A validação de nomePoder e descricao já deve ter ocorrido no Service/Model
        const SQL = "INSERT INTO Poderes (nomePoder, descricao) VALUES (?, ?);";
        const params = [objPoderModel.nomePoder, objPoderModel.descricao];

        console.log("🟢 PoderDAO.create - Executando SQL:", SQL, "com params:", params); // Log extra

        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);

        if (!resultado.insertId) {
            console.error("🔴 PoderDAO.create - Falha: insertId não retornado.", resultado);
            throw new Error("Falha ao inserir poder: insertId não retornado.");
        }
        console.log("🟢 PoderDAO.create - Poder inserido com ID:", resultado.insertId);
        return resultado.insertId;
    };

    delete = async (idPoder) => {
        console.log(`🟢 PoderDAO.delete() - Tentando excluir ID: ${idPoder}, Tipo: ${typeof idPoder}`);

        if (typeof idPoder !== 'number' || !Number.isInteger(idPoder) || idPoder <= 0) {
            console.error(`🔴 PoderDAO.delete - ID inválido recebido para exclusão: ${idPoder}`);
            throw new Error("ID de poder inválido para exclusão.");
        }

        const SQL = "DELETE FROM Poderes WHERE idPoder = ?;";
        const params = [idPoder];

        console.log("🟢 PoderDAO.delete - Executando SQL:", SQL, "com params:", params); // Log extra

        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);

        return resultado.affectedRows > 0;
    };

    update = async (objPoderModel) => {
        console.log("🟢 PoderDAO.update()");
        // A validação de nomePoder, descricao e idPoder já deve ter ocorrido no Service/Model
        const SQL = "UPDATE Poderes SET nomePoder = ?, descricao = ? WHERE idPoder = ?;";
        const params = [objPoderModel.nomePoder, objPoderModel.descricao, objPoderModel.idPoder];

        console.log("🟢 PoderDAO.update - Executando SQL:", SQL, "com params:", params); // Log extra

        const pool = await this.#database.getPool();
        const [resultado] = await pool.execute(SQL, params);

        return resultado.affectedRows > 0;
    };

    findAll = async () => {
        console.log("🟢 PoderDAO.findAll()");
        const SQL = "SELECT idPoder, nomePoder, descricao FROM Poderes;";
        const pool = await this.#database.getPool();
        const [rows] = await pool.execute(SQL);
        // CORREÇÃO AQUI: Retorna POJOs diretamente do banco, sem instanciar Poder desnecessariamente.
        return rows; 
    };

    findById = async (idPoder) => {
        console.log(`🟢 PoderDAO.findById() - Buscando ID: ${idPoder}, Tipo: ${typeof idPoder}`);

        // Validação de ID antes de enviar para o banco
        if (typeof idPoder !== 'number' || !Number.isInteger(idPoder) || idPoder <= 0) {
            console.error(`🔴 PoderDAO.findById - ID inválido recebido para busca: ${idPoder}`);
            // Lança um erro para o Service tratar, em vez de deixar o driver MySQL explodir.
            throw new Error(`ID de poder inválido ou ausente para busca: ${idPoder}`);
        }

        const SQL = "SELECT idPoder, nomePoder, descricao FROM Poderes WHERE idPoder = ?;";
        const params = [idPoder];

        console.log("🟢 PoderDAO.findById - Executando SQL:", SQL, "com params:", params); // Log extra

        const pool = await this.#database.getPool();
        const [rows] = await pool.execute(SQL, params);

        if (rows.length === 0) {
            console.log(`🟢 PoderDAO.findById - Poder com ID ${idPoder} não encontrado.`);
            return null;
        }
        // CORREÇÃO AQUI: Retorna o POJO diretamente do banco.
        return rows[0]; 
    };

    findByField = async (field, value) => {
        console.log(`🟢 PoderDAO.findByField() - Campo: ${field}, Valor: ${value}, Tipo: ${typeof value}`);

        const allowedFields = ["idPoder", "nomePoder"];
        if (!allowedFields.includes(field)) {
            console.error(`🔴 PoderDAO.findByField - Campo inválido para busca: ${field}`);
            throw new Error(`Campo inválido para busca: ${field}. Campos permitidos são: ${allowedFields.join(", ")}`);
        }

        const SQL = `SELECT idPoder, nomePoder, descricao FROM Poderes WHERE ${field} = ?;`;
        const params = [value];

        console.log("🟢 PoderDAO.findByField - Executando SQL:", SQL, "com params:", params); // Log extra

        const pool = await this.#database.getPool();
        const [rows] = await pool.execute(SQL, params);

        // CORREÇÃO AQUI: Retorna POJOs diretamente do banco.
        return rows;
    };
};