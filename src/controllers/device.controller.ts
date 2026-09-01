import type { Request, Response } from "express";
import * as db from "../config/db.js";
import { toTitleCase } from "../utils/toTItleCase.util.js";

export const createDevice = async (req: Request, res: Response) => {
  try {
    const {
      codigo_inventario,
      categoria_id,
      departamento_id,
      ram,
      rom,
      numero_telefono,
      imei,
      observaciones,
    } = req.body;

    const nombre = toTitleCase(req.body.nombre);
    const modelo = toTitleCase(req.body.modelo);

    const categoryCheck = await db.query(
      `SELECT 1 FROM categoria WHERE id = $1 AND activo = true`,
      [categoria_id],
    );

    if (categoryCheck.rowCount === 0) {
      return res
        .status(400)
        .json({ error: "La categoria no existe o se encuentra inactiva" });
    }

    const departmentCheck = await db.query(
      `SELECT 1 FROM departamento WHERE id = $1 AND activo = true`,
      [departamento_id],
    );

    if (departmentCheck.rowCount === 0) {
      return res
        .status(400)
        .json({ error: "El departamento no existe o se encuentra inactivo" });
    }

    const checkQuery = `SELECT 1 FROM equipo WHERE codigo_inventario = $1`;
    const checkResult = await db.query(checkQuery, [codigo_inventario]);

    if (checkResult.rowCount && checkResult.rowCount > 0) {
      return res.status(409).json({
        error: "Equipo ya creado con ese codigo",
      });
    }

    const createQuery = `INSERT INTO equipo (
      codigo_inventario,
      nombre,
      categoria_id,
      departamento_id,
      ram,
      rom,
      modelo,
      numero_telefono,
      imei,
      observaciones
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING * `;

    const values = [
      codigo_inventario,
      nombre ? nombre : null,
      categoria_id,
      departamento_id,
      ram ? ram : null,
      rom ? rom : null,
      modelo ? modelo : null,
      numero_telefono ? numero_telefono : null,
      imei ? imei : null,
      observaciones ? observaciones : null,
    ];

    const createResult = await db.query(createQuery, values);

    res.status(201).json({
      status: "success",
      response: "Equipo creado con exito",
      data: createResult.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar equipo" });
  }
};

export const getDevices = async (req: Request, res: Response) => {
  const {
    search = "",
    activo,
    categoria_id,
    departamento_id,
    page = 1,
    limit = 10,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.max(1, parseInt(limit as string));
  const offset = (pageNum - 1) * limitNum;
  const searchTerm = `%${search}%`;

  try {
    const filterByActivo = activo !== undefined && activo !== "";
    const activoVal = activo === "true";

    let baseSearchWhere = `WHERE (e.codigo_inventario ILIKE $1 OR e.nombre ILIKE $1 OR e.modelo ILIKE $1)`;
    const countParams: any[] = [searchTerm];
    let countParamIdx = 2;

    if (categoria_id) {
      baseSearchWhere += ` AND e.categoria_id = $${countParamIdx}`;
      countParams.push(categoria_id);
      countParamIdx++;
    }

    if (departamento_id) {
      baseSearchWhere += ` AND e.departamento_id = $${countParamIdx}`;
      countParams.push(departamento_id);
      countParamIdx++;
    }

    const totalsQuery = `
      SELECT 
        COUNT(*)::int AS total_all,
        COUNT(*) FILTER (WHERE e.activo = true)::int AS total_activos,
        COUNT(*) FILTER (WHERE e.activo = false)::int AS total_inactivos
      FROM equipo e
      ${baseSearchWhere}
    `;
    const totalsResult = await db.query(totalsQuery, countParams);
    const totals = totalsResult.rows[0];

    let queryConditions = baseSearchWhere;
    const queryParams: any[] = [...countParams];
    let queryParamIdx = countParamIdx;

    if (filterByActivo) {
      queryConditions += ` AND e.activo = $${queryParamIdx}`;
      queryParams.push(activoVal);
      queryParamIdx++;
    }

    const currentTotal = filterByActivo
      ? (activoVal ? totals.total_activos : totals.total_inactivos)
      : totals.total_all;

    queryParams.push(limitNum, offset);

    const getQuery = `
      SELECT 
        e.id, 
        e.codigo_inventario, 
        e.nombre, 
        e.categoria_id,
        e.departamento_id,
        e.estado,
        e.ram,
        e.rom,
        e.modelo,
        e.numero_telefono,
        e.imei,
        e.observaciones,
        c.nombre AS nombre_categoria,
        d.nombre AS nombre_departamento,
        e.activo
      FROM equipo e
      INNER JOIN categoria c ON c.id = e.categoria_id
      INNER JOIN departamento d ON d.id = e.departamento_id
      ${queryConditions}
      ORDER BY e.id ASC
      LIMIT $${queryParamIdx} OFFSET $${queryParamIdx + 1}
    `;

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
    res.status(500).json({ error: "Error al obtener equipos" });
  }
};

export const updateDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      categoria_id,
      departamento_id,
      estado,
      ram,
      rom,
      numero_telefono,
      imei,
      observaciones,
    } = req.body;

    const nombre = toTitleCase(req.body.nombre);
    const modelo = toTitleCase(req.body.modelo);

    const updateQuery = `UPDATE equipo SET categoria_id = $1, departamento_id = $2, estado = $3,
    ram = $4, rom = $5, numero_telefono = $6, imei = $7, observaciones = $8, nombre = $9, modelo = $10 WHERE id = $11`;
    const updateResult = await db.query(updateQuery, [
      categoria_id,
      departamento_id,
      estado,
      ram,
      rom,
      numero_telefono,
      imei,
      observaciones,
      nombre,
      modelo,
      id,
    ]);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "Equipo no encintrado" });
    }

    res.status(200).json({
      status: "success",
      response: "Equipo actualizado",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar equipo" });
  }
};

export const deleteDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const checkQuery = `SELECT 1 FROM equipo WHERE id = $1 AND estado = 'Asignado'`;
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rowCount && checkResult.rowCount > 0) {
      return res.status(400).json({
        error: "Equipo se encuentra asignado y no puede ser eliminado",
      });
    }

    const deleteQuery = `UPDATE equipo SET activo = false WHERE id = $1`;
    const deleteResult = await db.query(deleteQuery, [id]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    if (motivo) {
      const historyQuery = `INSERT INTO historial_bajas (entidad, entidad_id, motivo) VALUES ('equipo', $1, $2)`;
      await db.query(historyQuery, [id, motivo]);
    }

    res.status(200).json({
      status: "success",
      response: "Equipo eliminado",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar equipo" });
  }
};

export const restoreDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const restoreQuery = `UPDATE equipo SET activo = true WHERE id = $1`;
    const restoreResult = await db.query(restoreQuery, [id]);

    if (restoreResult.rowCount === 0) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }

    res.status(200).json({
      status: "success",
      response: "Equipo recuperado",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al recuperar equipo" });
  }
};

export const getDeviceHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const historyQuery = `
      SELECT id, entidad, entidad_id, motivo, created_at 
      FROM historial_bajas 
      WHERE entidad = 'equipo' AND entidad_id = $1 
      ORDER BY created_at DESC
    `;
    const historyResult = await db.query(historyQuery, [id]);

    res.status(200).json({
      status: "success",
      data: historyResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener historial del equipo" });
  }
};

