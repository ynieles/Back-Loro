import * as db from "../config/db.js";
// Registrar Empleado
export const createEmployee = async (req, res) => {
    try {
        const { ci, nombre, departamento_id } = req.body;
        const query = "SELECT 1 FROM empleado WHERE ci = $1";
        const result = await db.query(query, [ci]);
        if (result.rowCount && result.rowCount > 0) {
            res.status(409).json({ error: "Empleado ya registrado" });
            return;
        }
        const queryCreate = "INSERT INTO empleado (ci, nombre, departamento_id) VALUES ($1, $2, $3)";
        await db.query(queryCreate, [ci, nombre, departamento_id]);
        res.status(201).json({
            status: "success",
            response: "Empleado creado",
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "No se ha podido crear el empleado" });
    }
};
// Obtener Empleados Registrados
export const getEmployees = async (_req, res) => {
    try {
        const query = "SELECT e.ci, e.nombre AS nombre_empleado, d.nombre AS nombre_departamento FROM empleado e INNER JOIN departamento d ON e.departamento_id = d.id";
        const result = await db.query(query);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No hay empleados registrados" });
        }
        const results = result.rows;
        res.status(200).json({
            status: "success",
            results: results.length,
            data: results,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error del servidor" });
    }
};
//Actualizar empleado, se requieren todos los campos aunque no se vayan a actualizar
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { ci, nombre, departamento_id } = req.body;
        const query = "UPDATE empleado SET ci = $1, nombre = $2, departamento_id = $3 WHERE id = $4";
        const result = await db.query(query, [ci, nombre, departamento_id, id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Empleado no encontrado" });
        }
        res.status(200).json({
            status: "success",
            response: "Empleado actualizado",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar empleado" });
    }
};
//Obtener un empleado mediante la ci
export const getOneEmployee = async (req, res) => {
    try {
        const { ci } = req.params;
        const query = "SELECT e.ci, e.nombre AS nombre_empleado, d.nombre AS nombre_departamento FROM empleado e INNER JOIN departamento d ON e.departamento_id = d.id WHERE ci = $1";
        const result = await db.query(query, [ci]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Empleado no encontrado" });
        }
        const data = result.rows;
        res.status(200).json({
            status: "success",
            response: data,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener el empleado" });
    }
};
//# sourceMappingURL=empleados.controller.js.map