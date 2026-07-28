import type { Response, Request } from "express";
import { toTitleCase } from "../utils/toTItleCase.util.js";
import * as db from "../config/db.js";

//Registrar departamento

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const nombre = toTitleCase(req.body.nombre);

    const checkQuery = "SELECT 1 FROM departamento WHERE nombre = $1";
    const checkResult = await db.query(checkQuery, [nombre]);

    if (checkResult.rowCount && checkResult.rowCount > 0) {
      return res.status(409).json({
        error: "Departamento ya registrado con ese nombre",
      });
    }

    const createQuery =
      "INSERT INTO departamento (nombre) VALUES ($1) RETURNING * ";

    const createResult = await db.query(createQuery, [nombre]);

    res.status(201).json({
      status: "success",
      response: "Departamento creado con exito ",
      data: createResult.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar departamento" });
  }
};

//Obtener todos los departamentos

export const getDepartments = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, activo = true } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.max(1, parseInt(limit as string));
  const offset = (pageNum - 1) * limitNum;

  try {
    const countQuery = `SELECT COUNT(*) FROM departamento WHERE activo = $1`;
    const countResult = await db.query(countQuery, [activo]);
    const totalRecords = parseInt(countResult.rows[0].count);

    const getQuery = `SELECT id, nombre, activo FROM departamento WHERE activo = $1
      ORDER BY id ASC LIMIT $2 OFFSET $3`;
    const getResult = await db.query(getQuery, [activo, limit, offset]);

    if (getResult.rows.length === 0) {
      return res.status(404).json({
        error: "No hay departamentos registrados",
      });
    }

    res.status(200).json({
      status: "success",
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
      data: getResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener departamentos" });
  }
};

//Obtener un departamento mediante el nombre

export const getOneDeparment = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.params;

    const getQuery =
      "SELECT id, nombre, activo FROM departamento WHERE nombre ILIKE $1 AND activo = true";
    const getResult = await db.query(getQuery, [`%${nombre}%`]);

    if (getResult.rows.length === 0) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }

    res.status(200).json({
      status: "success",
      response: getResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al encontrar departamento" });
  }
};

//Actualizar un departamento

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const nombre = toTitleCase(req.body.nombre);

    const updateQuery = "UPDATE departamento SET nombre = $1 WHERE id = $2";
    const updateResult = await db.query(updateQuery, [nombre, id]);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }

    res.status(200).json({
      status: "success",
      response: "Departamento actualizado",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar departamento" });
  }
};

//Eliminar departamento

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleteQuery = `UPDATE departamento SET activo = false WHERE id = $1`;
    const deleteResult = await db.query(deleteQuery, [id]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }

    res.status(200).json({
      status: "success",
      response: "Departamento eliminado",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar departamento" });
  }
};

//Restaurar departamento

export const restoreDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const restoreQuery = `UPDATE departamento SET activo = true WHERE id = $1`;
    const restoreResult = await db.query(restoreQuery, [id]);

    if (restoreResult.rowCount === 0) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }

    res.status(200).json({
      status: "success",
      response: "Departamento recuperado",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al recuperar departamento" });
  }
};
