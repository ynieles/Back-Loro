import type { Response, Request } from "express";
import * as db from "../config/db.js";
import { toTitleCase } from "../utils/toTItleCase.util.js";

// Registrar Empleado

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { ci, rol_id } = req.body;
    const nombre = toTitleCase(req.body.nombre);

    const roleCheck = await db.query(
      `SELECT 1 FROM rol WHERE id = $1 AND activo = true`,
      [rol_id],
    );

    if (roleCheck.rowCount === 0) {
      return res
        .status(400)
        .json({ error: "El rol no existe o se encuentra inactivo" });
    }

    const checkQuery = "SELECT 1 FROM empleado WHERE ci = $1";
    const checkResult = await db.query(checkQuery, [ci]);

    if (checkResult.rowCount && checkResult.rowCount > 0) {
      res.status(409).json({ error: "Empleado ya registrado con esa CI" });
      return;
    }

    const queryCreate =
      "INSERT INTO empleado (ci, nombre, rol_id) VALUES ($1, $2, $3) RETURNING * ";

    const createResult = await db.query(queryCreate, [ci, nombre, rol_id]);

    res.status(201).json({
      status: "success",
      response: "Empleado creado con exito",
      data: createResult.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al registrar empleado" });
  }
};

// Obtener Empleados Registrados

export const getEmployees = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    activo = true,
    search = "",
    rol_id,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.max(1, parseInt(limit as string));
  const offset = (pageNum - 1) * limitNum;

  try {
    const countQuery = `SELECT COUNT(*) FROM empleado WHERE activo = $1`;
    const countResult = await db.query(countQuery, [activo]);
    const totalRecords = parseInt(countResult.rows[0].count);

    const getQuery = `SELECT e.id, e.ci, e.nombre AS nombre_empelado, d.nombre AS nombre_departamento,
        r.nombre AS nombre_rol, e.activo FROM empleado e INNER JOIN rol r
        ON r.id = e.rol_id INNER JOIN departamento d ON d.id = r.departamento_id
        WHERE e.activo = $1
        ORDER BY e.id ASC LIMIT $2 OFFSET $3
        `;
    const getResult = await db.query(getQuery, [activo, limitNum, offset]);

    if (getResult.rows.length === 0) {
      return res.status(404).json({ error: "No hay empleados registrados" });
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
    console.log(error);
    res.status(500).json({ error: "Error al obtener empelados" });
  }
};

//Actualizar empleado, se requieren todos los campos aunque no se vayan a actualizar

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ci, rol_id } = req.body;
    const nombre = toTitleCase(req.body.nombre);

    const updateQuery =
      "UPDATE empleado SET ci = $1, nombre = $2, rol_id = $3 WHERE id = $4";

    const updateResult = await db.query(updateQuery, [ci, nombre, rol_id, id]);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.status(200).json({
      status: "success",
      response: "Empleado actualizado",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar empleado" });
  }
};

//Obtener un empleado mediante la ci

export const getOneEmployee = async (req: Request, res: Response) => {
  try {
    const { ci } = req.params;

    const query = `SELECT e.id, e.ci, e.nombre AS nombre_empelado, d.nombre AS nombre_departamento,
        r.nombre AS nombre_rol, e.activo FROM empleado e INNER JOIN rol r
        ON r.id = e.rol_id INNER JOIN departamento d ON d.id = r.departamento_id WHERE ci ILIKE $1`;
    const result = await db.query(query, [`%${ci}%`]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    const data = result.rows;

    res.status(200).json({
      status: "success",
      response: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el empleado" });
  }
};

//Eliminado logico de un empleado

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleteQuery = `UPDATE empleado SET activo = false WHERE id = $1`;
    const resultQuery = await db.query(deleteQuery, [id]);

    if (resultQuery.rowCount === 0) {
      return res.status(404).json({ error: "Empleado no encontardo" });
    }

    res.status(200).json({
      status: "success",
      response: "Empleado eliminado",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar empleado" });
  }
};

//Recuperar empleado

export const restoreEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const restoreQuery = `UPDATE empleado SET activo = true WHERE id = $1`;
    const restoreResult = await db.query(restoreQuery, [id]);

    if (restoreResult.rowCount === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.status(200).json({
      status: "success",
      response: "Empleado recuperado",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al recuperar empleado" });
  }
};
