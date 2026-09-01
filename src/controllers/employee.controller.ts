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
  const { page = 1, limit = 10, search = "", activo } = req.query;
  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.max(1, parseInt(limit as string));
  const offset = (pageNum - 1) * limitNum;
  const searchStr = `%${search}%`;
  try {
    const filterByActivo = activo !== undefined && activo !== "";
    const activoVal = activo === "true";
    // 1. Obtener contadores globales (Total, Activos, Inactivos) filtrados por la búsqueda
    const totalsQuery = `
      SELECT 
        COUNT(*)::int AS total_all,
        COUNT(*) FILTER (WHERE activo = true)::int AS total_activos,
        COUNT(*) FILTER (WHERE activo = false)::int AS total_inactivos
      FROM empleado
      WHERE (nombre ILIKE $1 OR ci ILIKE $1)
    `;
    const totalsResult = await db.query(totalsQuery, [searchStr]);
    const totals = totalsResult.rows[0];
    // 2. Definir los parámetros para los registros paginados
    const whereClause = filterByActivo
      ? `WHERE (e.nombre ILIKE $1 OR e.ci ILIKE $1) AND e.activo = $4`
      : `WHERE (e.nombre ILIKE $1 OR e.ci ILIKE $1)`;
    const queryParams = filterByActivo
      ? [searchStr, limitNum, offset, activoVal]
      : [searchStr, limitNum, offset];
    const currentTotal = filterByActivo
      ? activoVal
        ? totals.total_activos
        : totals.total_inactivos
      : totals.total_all;
    // 3. Obtener registros paginados
    const getQuery = `
      SELECT e.id, e.ci, e.nombre AS nombre_empleado, e.rol_id, d.nombre AS nombre_departamento,
             r.nombre AS nombre_rol, e.activo 
      FROM empleado e 
      INNER JOIN rol r ON r.id = e.rol_id 
      INNER JOIN departamento d ON d.id = r.departamento_id
      ${whereClause}
      ORDER BY e.id ASC LIMIT $2 OFFSET $3
    `;
    const getResult = await db.query(getQuery, queryParams);
    // 4. Responder con los totales en la propiedad `totals`
    res.status(200).json({
      status: "success",
      pagination: {
        totalRecords: currentTotal,
        totalPages: Math.ceil(currentTotal / limitNum),
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
    console.log(error);
    res.status(500).json({ error: "Error al obtener empleados" });
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
    const { motivo } = req.body;

    const deleteQuery = `UPDATE empleado SET activo = false WHERE id = $1`;
    const resultQuery = await db.query(deleteQuery, [id]);

    if (resultQuery.rowCount === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    if (motivo) {
      const historyQuery = `INSERT INTO historial_bajas (entidad, entidad_id, motivo) VALUES ('empleado', $1, $2)`;
      await db.query(historyQuery, [id, motivo]);
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

//Obtener historial de motivos de desactivacion de un empleado

export const getEmployeeHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const historyQuery = `
      SELECT id, entidad, entidad_id, motivo, created_at 
      FROM historial_bajas 
      WHERE entidad = 'empleado' AND entidad_id = $1 
      ORDER BY created_at DESC
    `;
    const historyResult = await db.query(historyQuery, [id]);

    res.status(200).json({
      status: "success",
      data: historyResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener historial del empleado" });
  }
};

