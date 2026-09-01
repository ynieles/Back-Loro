import { response } from "express";
import { toTitleCase } from "../utils/toTItleCase.util.js";
import * as db from "../config/db.js";
//Registrar un nuevo rol
export const createRole = async (req, res) => {
    try {
        const nombre = toTitleCase(req.body.nombre);
        const { departamento_id } = req.body;
        const departmentCheck = await db.query(`SELECT 1 FROM departamento WHERE id = $1 AND activo = true`, [departamento_id]);
        if (departmentCheck.rowCount === 0) {
            return res
                .status(400)
                .json({ error: "El departamento no existe o se encuentra inactivo" });
        }
        const checkQuery = `SELECT 1 FROM rol WHERE nombre ILIKE $1 AND departamento_id = $2`;
        const checkResult = await db.query(checkQuery, [nombre, departamento_id]);
        if (checkResult.rows.length > 0) {
            return res.status(409).json({
                error: "Rol ya registrado con ese nombre en ese departamento",
            });
        }
        const createQuery = `INSERT INTO rol (nombre, departamento_id) VALUES ($1, $2) RETURNING *`;
        const createResult = await db.query(createQuery, [nombre, departamento_id]);
        res.status(202).json({
            status: "success",
            response: "Rol creado con exito",
            data: createResult.rows[0],
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar rol" });
    }
};
//Obtener roles
export const getRoles = async (req, res) => {
    const { page = 1, limit = 10, search = "", activo } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    const searchStr = `%${search}%`;
    try {
        const filterByActivo = activo !== undefined && activo !== "";
        const activoVal = activo === "true";
        const totalsQuery = `
      SELECT 
        COUNT(*)::int AS total_all,
        COUNT(*) FILTER (WHERE r.activo = true)::int AS total_activos,
        COUNT(*) FILTER (WHERE r.activo = false)::int AS total_inactivos
      FROM rol r
      INNER JOIN departamento d ON r.departamento_id = d.id
      WHERE (r.nombre ILIKE $1 OR d.nombre ILIKE $1)
    `;
        const totalsResult = await db.query(totalsQuery, [searchStr]);
        const totals = totalsResult.rows[0];
        const whereClause = filterByActivo
            ? `WHERE (r.nombre ILIKE $1 OR d.nombre ILIKE $1) AND r.activo = $4`
            : `WHERE (r.nombre ILIKE $1 OR d.nombre ILIKE $1)`;
        const queryParams = filterByActivo
            ? [searchStr, limitNum, offset, activoVal]
            : [searchStr, limitNum, offset];
        const currentTotal = filterByActivo
            ? (activoVal ? totals.total_activos : totals.total_inactivos)
            : totals.total_all;
        const getQuery = `SELECT r.id, r.nombre as nombre_rol, r.departamento_id, d.nombre as nombre_departamento, r.activo 
      FROM rol r
      INNER JOIN departamento d ON r.departamento_id = d.id 
      ${whereClause}
      ORDER BY r.id ASC LIMIT $2 OFFSET $3`;
        const getResult = await db.query(getQuery, queryParams);
        res.status(200).json({
            status: "success",
            pagination: {
                totalRecords: currentTotal,
                totalPages: Math.ceil(currentTotal / limitNum) || 1,
                currentPage: pageNum,
                limit: limitNum,
                totals: {
                    all: totals.total_all,
                    activos: totals.total_activos,
                    inactivos: totals.total_inactivos,
                },
            },
            data: getResult.rows,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener roles" });
    }
};
//Obtener un rol mediante el nombre
export const getOneRole = async (req, res) => {
    try {
        const { nombre } = req.params;
        const getOneQuery = `SELECT r.id,  r.nombre as nombre_rol, d.nombre as nombre_departamento, r.activo from rol r
    INNER JOIN departamento d on r.departamento_id = d.id WHERE r.nombre ILIKE $1 AND r.activo = true`;
        const getOneResult = await db.query(getOneQuery, [`%${nombre}%`]);
        if (getOneResult.rows.length === 0) {
            return res.status(404).json({ error: "Rol no encontrado" });
        }
        const data = getOneResult.rows[0];
        res.status(200).json({
            status: "success",
            response: data,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al encontrar rol" });
    }
};
//Actualizar rol
export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const nombre = toTitleCase(req.body.nombre);
        const { departamento_id } = req.body;
        const updateQuery = `UPDATE rol SET nombre = $1, departamento_id = $2 WHERE id = $3`;
        const updateResult = await db.query(updateQuery, [
            nombre,
            departamento_id,
            id,
        ]);
        if (updateResult.rowCount === 0) {
            return res.status(404).json({ error: "Rol no encontrado" });
        }
        res.status(201).json({
            status: "success",
            response: "ROl actualizado",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar rol" });
    }
};
//Eliminar rol
export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteQuery = `UPDATE rol SET activo = false WHERE id = $1`;
        const deleteResult = await db.query(deleteQuery, [id]);
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ error: "Rol no ecnontrado" });
        }
        res.status(200).json({
            status: "success",
            response: "Rol eliminado",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar rol" });
    }
};
//Recuperar rol
export const restoreRole = async (req, res) => {
    try {
        const { id } = req.params;
        const restoreQuery = `UPDATE rol SET activo = true WHERE id = $1`;
        const restoreResult = await db.query(restoreQuery, [id]);
        if (restoreResult.rowCount === 0) {
            return res.status(404).json({ error: "Rol no ecnontrado" });
        }
        res.status(200).json({
            status: "success",
            response: "Rol recuperado",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al recuperar rol" });
    }
};
//# sourceMappingURL=role.controller.js.map