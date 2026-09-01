import * as db from "../config/db.js";
export const createAssignment = async (req, res) => {
    try {
        const { empleado_id, equipo_id } = req.body;
        const employeCheck = await db.query(`SELECT 1 FROM empleado WHERE id = $1 AND activo = true`, [empleado_id]);
        if (employeCheck.rowCount === 0) {
            return res
                .status(400)
                .json({ error: "El empleado no existe o se encuentra inactivo" });
        }
        const deviceCheck = await db.query(`SELECT estado FROM equipo WHERE id = $1 AND activo = true`, [equipo_id]);
        if (deviceCheck.rowCount === 0) {
            return res
                .status(400)
                .json({ error: "El equipo no existe o esta inactivo" });
        }
        if (deviceCheck.rows[0].estado === "Asignado") {
            return res
                .status(400)
                .json({ error: "El equipo ya se encuentra asignado" });
        }
        const createQuery = `INSERT INTO asignacion (equipo_id, empleado_id)
     VALUES ($1, $2) RETURNING *`;
        const createResult = await db.query(createQuery, [equipo_id, empleado_id]);
        // Actualizar el estado del equipo a 'Asignado'
        const updateDeviceQuery = `UPDATE equipo SET estado = 'Asignado' WHERE id = $1`;
        await db.query(updateDeviceQuery, [equipo_id]);
        res.status(201).json({
            status: "success",
            response: "Asignación creada con éxito",
            data: createResult.rows[0],
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar asignación" });
    }
};
export const getAssignments = async (req, res) => {
    const { search = "", activo, empleado_id, equipo_id, page = 1, limit = 10, } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    const searchTerm = `%${search}%`;
    try {
        const filterByActivo = activo !== undefined && activo !== "";
        const activoVal = activo === "true";
        let baseSearchWhere = `WHERE (e.codigo_inventario ILIKE $1 OR e.nombre ILIKE $1 OR emp.nombre ILIKE $1 OR emp.ci ILIKE $1)`;
        const countParams = [searchTerm];
        let countParamIdx = 2;
        if (empleado_id) {
            baseSearchWhere += ` AND a.empleado_id = $${countParamIdx}`;
            countParams.push(empleado_id);
            countParamIdx++;
        }
        if (equipo_id) {
            baseSearchWhere += ` AND a.equipo_id = $${countParamIdx}`;
            countParams.push(equipo_id);
            countParamIdx++;
        }
        // Totales para las tarjetas KPI
        const totalsQuery = `
      SELECT 
        COUNT(*)::int AS total_all,
        COUNT(*) FILTER (WHERE a.activo = true)::int AS total_activos,
        COUNT(*) FILTER (WHERE a.activo = false)::int AS total_inactivos
      FROM asignacion a
      INNER JOIN equipo e ON e.id = a.equipo_id
      INNER JOIN empleado emp ON emp.id = a.empleado_id
      ${baseSearchWhere}
    `;
        const totalsResult = await db.query(totalsQuery, countParams);
        const totals = totalsResult.rows[0];
        let queryConditions = baseSearchWhere;
        const queryParams = [...countParams];
        let queryParamIdx = countParamIdx;
        if (filterByActivo) {
            queryConditions += ` AND a.activo = $${queryParamIdx}`;
            queryParams.push(activoVal);
            queryParamIdx++;
        }
        const currentTotal = filterByActivo
            ? activoVal
                ? totals.total_activos
                : totals.total_inactivos
            : totals.total_all;
        queryParams.push(limitNum, offset);
        // Consulta con JOINs
        const getQuery = `
      SELECT 
        a.id,
        a.equipo_id,
        a.empleado_id,
        a.fecha_inicio,
        a.fecha_fin,
        e.codigo_inventario AS codigo_equipo,
        e.nombre AS nombre_equipo,
        e.modelo AS modelo_equipo,
        emp.ci AS cedula_empleado,
        emp.nombre AS nombre_empleado,
        d.nombre AS nombre_departamento,
        a.activo
      FROM asignacion a
      INNER JOIN equipo e ON e.id = a.equipo_id
      INNER JOIN empleado emp ON emp.id = a.empleado_id
      LEFT JOIN rol r ON r.id = emp.rol_id
      LEFT JOIN departamento d ON d.id = r.departamento_id
      ${queryConditions}
      ORDER BY a.id DESC
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las asignaciones" });
    }
};
export const deleteAssignment = async (req, res) => {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar asignacion" });
    }
};
//# sourceMappingURL=assignment.controller.js.map