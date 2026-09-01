import { response, type Request, type Response } from "express";
import * as db from "../config/db.js";
import { toTitleCase } from "../utils/toTItleCase.util.js";

export const createCategory = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al registrar categoria",
    });
  }
};

export const getCategorys = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search = "", activo } = req.query;
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.max(1, parseInt(limit as string));
  const offset = (pageNum - 1) * limitNum;
  const searchStr = `%${search}%`;

  try {
    const filterByActivo = activo !== undefined && activo !== "";
    const activoVal = activo === "true";

    const totalsQuery = `
      SELECT 
        COUNT(*)::int AS total_all,
        COUNT(*) FILTER (WHERE activo = true)::int AS total_activos,
        COUNT(*) FILTER (WHERE activo = false)::int AS total_inactivos
      FROM categoria
      WHERE nombre ILIKE $1
    `;
    const totalsResult = await db.query(totalsQuery, [searchStr]);
    const totals = totalsResult.rows[0];

    const whereClause = filterByActivo
      ? `WHERE nombre ILIKE $1 AND activo = $4`
      : `WHERE nombre ILIKE $1`;
    const queryParams = filterByActivo
      ? [searchStr, limitNum, offset, activoVal]
      : [searchStr, limitNum, offset];

    const currentTotal = filterByActivo
      ? activoVal
        ? totals.total_activos
        : totals.total_inactivos
      : totals.total_all;

    const getQuery = `SELECT id, nombre, activo FROM categoria ${whereClause}
      ORDER BY id ASC LIMIT $2 OFFSET $3`;
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};

export const getOneCategory = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al encontrar categoria" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar categoria" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar categoria" });
  }
};

export const restoreCategory = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al recuperar categoria" });
  }
};
