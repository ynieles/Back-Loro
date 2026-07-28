import * as db from "../config/db.js";
export const createDepartment = async (req, res) => {
    try {
        const { nombre } = req.body;
        const query = "SELECT 1 FROM departamento WHERE nombre = $1";
        const result = await db.query(query, [nombre]);
        if (result.rowCount && result.rowCount > 0) {
            return res.status(409).json({
                error: "Departamento ya registrado con ese nombre",
            });
        }
        const queryCreate = "INSERT INTO departamento (nombre) VALUES ($1)";
        await db.query(queryCreate, [nombre]);
        res.status(201).json({
            status: "success",
            response: "Departamento creado con exito ",
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "No se ha podido registrar el departamento" });
    }
};
export const getDepartments = async (req, res) => {
    try {
        const query = "SELECT nombre FROM departamento ";
        const result = await db.query(query);
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "No hay departamentos registrados",
            });
        }
        const results = result.rows;
        res
            .status(200)
            .json({ status: "success", results: results.length, data: result });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar departamento" });
    }
};
//# sourceMappingURL=departamentos.controller.js.map