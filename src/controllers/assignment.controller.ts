import type { Request, Response } from "express";
import * as db from "../config/db.js";

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const { empleado_id, equipo_id } = req.body;

    const employeCheck = await db.query(
      `SELECT 1 FROM empleado WHERE id = $1 AND activo = true`,
      [empleado_id],
    );

    if (employeCheck.rowCount === 0) {
      return res
        .status(400)
        .json({ error: "El empleado no existe o se encuentra inactivo" });
    }

    const deviceCheck = await db.query(
      `SELECT estado FROM equipo WHERE id = $1 AND activo = true'`,
      [equipo_id],
    );

    if (deviceCheck.rowCount === 0) {
      return res
        .status(400)
        .json({ error: "El equipo no existe o esta inactivo" });
    }

    if (deviceCheck.rows[0].estado === "Asignado") {
      return res
        .status(400)
        .json({ error: "El equipo ya se encuntra asignado" });
    }

    const createQuery = `INSERT INTO asignacion (equipo_id, empleado_id)
     VALUES ($1, $2) RETURNING *`;
    const createResult = await db.query(createQuery, [equipo_id, empleado_id]);

    res.status(201).json({
      status: "success",
      response: "Asignacion creada con exito",
      data: createResult.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar asignacion" });
  }
};

export const getAssignments = async (req: Request, res: Response) => {
  const {
    search = "",
    activo = "true",
    empleado_id,
    equipo_id,
    page = 1,
    limit = 10,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.max(1, parseInt(limit as string));
  const offset = (pageNum - 1) * limitNum;

  const searchTerm = `%${search}%`;
  const isActive = activo === "true";

  try {
    let queryConditions = `WHERE a.activo = $1 AND (e.codigo_inventario ILIKE $2 OR emp.nombre ILIKE $2)`;
    const queryParams: any[] = [isActive, searchTerm];
    let paramIndex = 3;

    if (empleado_id) {
      queryConditions += ` AND a.empleado_id = $${paramIndex}`;
      queryParams.push(empleado_id);
      paramIndex++;
    }

    if (equipo_id) {
      queryConditions += ` AND a.equipo_id = $${paramIndex}`;
      queryParams.push(equipo_id);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) 
      FROM asignacion a
      INNER JOIN equipo e ON e.id = a.equipo_id
      INNER JOIN empleado emp ON emp.id = a.empleado_id
      ${queryConditions}
    `;
    const countResult = await db.query(countQuery, queryParams);
    const totalRecords = parseInt(countResult.rows[0].count);

    queryParams.push(limitNum, offset);

    // 4. Consulta principal con los JOINs necesarios
    const getQuery = `
      SELECT 
        a.id,
        a.fecha_inicio,
        a.fecha_fin,
        e.codigo_inventario AS codigo_equipo,
        e.nombre AS nombre_equipo,
        emp.ci AS cedula_empleado,
        emp.nombre AS nombre_empleado,
        a.activo
      FROM asignacion a
      INNER JOIN equipo e ON e.id = a.equipo_id
      INNER JOIN empleado emp ON emp.id = a.empleado_id
      ${queryConditions}
      ORDER BY a.id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const getResult = await db.query(getQuery, queryParams);

    if (getResult.rows.length === 0 && pageNum === 1) {
      return res
        .status(404)
        .json({ error: "No se encontraron asignaciones registradas" });
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
    res.status(500).json({ error: "Error al obtener las asignaciones" });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleteQuery = `UPDATE asignacion SET activo = false, fecha_fin = NOW() WHERE id = $1 RETURNING equipo_id`;
    const deleteResult = await db.query(deleteQuery, [id]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "Asignacion no encontrada" });
    }

    const avalaibleQuery = `UPDATE equipo SET estado = DEFAULT WHERE id = $1`;
    await db.query(avalaibleQuery, [deleteResult.rows[0].equipo_id]);

    res.status(200).json({
      status: "success",
      response: "Asignacion eliminada y equipo liberado",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar asignacion" });
  }
};
