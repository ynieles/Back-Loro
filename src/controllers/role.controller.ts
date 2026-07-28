import { response, type Request, type Response } from "express";
import { toTitleCase } from "../utils/toTItleCase.util.js";
import * as db from "../config/db.js";

//Registrar un nuevo rol

export const createRole = async (req: Request, res: Response) => {
  try {
    const nombre = toTitleCase(req.body.nombre);
    const { departamento_id } = req.body;

    const departmentCheck = await db.query(
      `SELECT 1 FROM departamento WHERE id = $1 AND activo = true`,
      [departamento_id],
    );

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar rol" });
  }
};

//Obtener roles
export const getRoles = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, activo = true } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.max(1, parseInt(limit as string));
  const offset = (pageNum - 1) * limitNum;
  try {
    const countQuery = `SELECT COUNT(*) FROM rol WHERE activo = $1`;
    const countResult = await db.query(countQuery, [activo]);
    const totalRecords = parseInt(countResult.rows[0].count);

    const getQuery = `SELECT r.id,  r.nombre as nombre_rol, d.nombre as nombre_departamento, r.activo from rol r
    INNER JOIN departamento d on r.departamento_id = d.id WHERE r.activo = $1
     ORDER BY r.id ASC LIMIT $2 OFFSET  $3`;
    const getResult = await db.query(getQuery, [activo, limitNum, offset]);

    if (getResult.rows.length === 0) {
      return res.status(404).json({ error: "No hay roles registrados" });
    }

    res.status(200).json({
      status: "success",
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum),
        currentePage: pageNum,
        limit: limitNum,
      },
      data: getResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener roles" });
  }
};

//Obtener un rol mediante el nombre
export const getOneRole = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al encontrar rol" });
  }
};

//Actualizar rol
export const updateRole = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar rol" });
  }
};

//Eliminar rol
export const deleteRole = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar rol" });
  }
};

//Recuperar rol
export const restoreRole = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al recuperar rol" });
  }
};
