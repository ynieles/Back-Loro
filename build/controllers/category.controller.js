import { response } from "express";
import * as db from "../config/db.js";
import { toTitleCase } from "../utils/toTItleCase.util.js";
export const createCategory = async (req, res) => {
    try {
        const nombre = toTitleCase(req.body.nombre);
        const checkQuery = `SELECT 1 FROM categoria WHERE nombre = $1`;
        const checkResult = await db.query(checkQuery, [nombre]);
        if (checkResult.rowCount && checkResult.rowCount > 0) {
            return res
                .status(409)
                .json({ error: "Categoria ya registrado con ese nombre" });
        }
        const createQuery = `INSERT INTO categoria (nombre) VALUES ($1) RETURNING *`;
        const createResult = await db.query(createQuery, [nombre]);
        res.status(201).json({
            status: "success",
            response: "Categoria creada con exito",
            data: createResult.rows[0],
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Error al registrar categoria",
        });
    }
};
export const getCategorys = async (req, res) => {
    const { page = 1, limit = 10, activo = true, search = "" } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    const searchStr = `%${search}%`;
    try {
        const filterByActivo = activo !== undefined && activo !== "";
        const activoVal = activo === "true" || activo === true;
        const countQuery = filterByActivo
            ? `SELECT COUNT(*) FROM categoria WHERE nombre ILIKE $1 AND activo = $2`
            : `SELECT COUNT(*) FROM categoria WHERE nombre ILIKE $1`;
        const countParams = filterByActivo ? [searchStr, activoVal] : [searchStr];
        const countResult = await db.query(countQuery, countParams);
        const totalRecords = parseInt(countResult.rows[0].count);
        const getQuery = filterByActivo
            ? `SELECT id, nombre, activo FROM categoria WHERE nombre ILIKE $1 AND activo = $4 ORDER BY id ASC LIMIT $2 OFFSET $3`
            : `SELECT id, nombre, activo FROM categoria WHERE nombre ILIKE $1 ORDER BY id ASC LIMIT $2 OFFSET $3`;
        const queryParams = filterByActivo
            ? [searchStr, limitNum, offset, activoVal]
            : [searchStr, limitNum, offset];
        const getResult = await db.query(getQuery, queryParams);
        res.status(200).json({
            status: "success",
            pagination: {
                totalRecords,
                totalPages: Math.ceil(totalRecords / limitNum) || 1,
                currentPage: pageNum,
                limit: limitNum,
            },
            data: getResult.rows,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener categorías" });
    }
};
export const getOneCategory = async (req, res) => {
    try {
        const { nombre } = req.body;
        const getOneQuery = `SELECT id, nombre, activo FROM categoria WHERE nombre ILIKE $1 AND activo = true`;
        const getOneResult = await db.query(getOneQuery, [`%${nombre}%`]);
        if (getOneResult.rows.length === 0) {
            return res.status(404).json({ error: "Categoria no encontrada" });
        }
        res.status(200).json({
            status: "success",
            response: getOneResult.rows,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al encontrar categoria" });
    }
};
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const nombre = toTitleCase(req.body.nombre);
        const updateQuery = `UPDATE categoria SET nombre = $1 WHERE id = $2`;
        const updateResult = await db.query(updateQuery, [nombre, id]);
        if (updateResult.rowCount === 0) {
            return res.status(404).json({ error: "Categoria no encontrada " });
        }
        res.status(200).json({
            status: "success",
            response: "Categoria actualizada",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar categoria" });
    }
};
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteQuery = `UPDATE categoria SET activo = false WHERE id = $1`;
        const deleteResult = await db.query(deleteQuery, [id]);
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ error: "Categoria no encontrada" });
        }
        res.status(200).json({
            status: "success",
            response: "Categoria eliminada ",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar categoria" });
    }
};
export const restoreCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const restoreQuery = `UPDATE categoria SET activo = true WHERE id = $1`;
        const restoreResult = await db.query(restoreQuery, [id]);
        if (restoreResult.rowCount === 0) {
            return res.status(404).json("Categoria no encontrada");
        }
        res.status(200).json({
            status: "success",
            response: "Categoria recuperada",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al recuperar categoria" });
    }
};
//# sourceMappingURL=category.controller.js.map