import * as db from "../config/db.js";
import { supabase } from "../config/supabaseClient.js";
// Crear un nuevo usuario en Supabase Auth y registrar en la tabla public.usuario
export const createUser = async (req, res) => {
    var _a;
    const { email, password, nombre, rol } = req.body;
    try {
        // 1. Verificar si ya existe en la DB
        const checkQuery = `SELECT 1 FROM public.usuario WHERE email = $1`;
        const checkResult = await db.query(checkQuery, [email]);
        if (checkResult.rows.length > 0) {
            return res.status(409).json({
                error: "Ya existe un usuario registrado con ese correo electrónico",
            });
        }
        // 2. Registrar en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombre,
                    rol,
                },
            },
        });
        if (authError) {
            return res.status(400).json({ error: authError.message });
        }
        const userId = (_a = authData.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res
                .status(500)
                .json({ error: "No se pudo obtener el ID del usuario creado" });
        }
        // 3. Insertar o actualizar en la tabla public.usuario
        const query = `
      INSERT INTO public.usuario (id, nombre, email, rol, activo)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT (id) DO UPDATE
      SET nombre = EXCLUDED.nombre, rol = EXCLUDED.rol, email = EXCLUDED.email, activo = true
      RETURNING *;
    `;
        const result = await db.query(query, [userId, nombre, email, rol]);
        return res.status(201).json({
            status: "success",
            message: "Usuario registrado con éxito. Se ha enviado un correo para validar su cuenta.",
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Error al guardar los datos del usuario" });
    }
};
// Obtener usuarios paginados con búsqueda y filtro de activo
export const getUsers = async (req, res) => {
    const { page = 1, limit = 10, search = "", activo } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    const searchStr = `%${search}%`;
    try {
        // Asegurar que la columna 'activo' exista en public.usuario
        await db.query(`ALTER TABLE public.usuario ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;`);
        const filterByActivo = activo !== undefined && activo !== "";
        const activoVal = activo === "true";
        const totalsQuery = `
      SELECT 
        COALESCE(COUNT(*), 0)::int AS total_all,
        COALESCE(COUNT(*) FILTER (WHERE activo = true OR activo IS NULL), 0)::int AS total_activos,
        COALESCE(COUNT(*) FILTER (WHERE activo = false), 0)::int AS total_inactivos
      FROM public.usuario
      WHERE (COALESCE(nombre, '') ILIKE $1 OR COALESCE(email, '') ILIKE $1)
    `;
        const totalsResult = await db.query(totalsQuery, [searchStr]);
        const totals = totalsResult.rows[0] || {
            total_all: 0,
            total_activos: 0,
            total_inactivos: 0,
        };
        let whereClause = `WHERE (COALESCE(nombre, '') ILIKE $1 OR COALESCE(email, '') ILIKE $1)`;
        const queryParams = [searchStr, limitNum, offset];
        if (filterByActivo) {
            queryParams.push(activoVal);
            whereClause += ` AND COALESCE(activo, true) = $4`;
        }
        const totalAll = parseInt(totals.total_all) || 0;
        const totalActivos = parseInt(totals.total_activos) || 0;
        const totalInactivos = parseInt(totals.total_inactivos) || 0;
        const currentTotal = filterByActivo
            ? activoVal
                ? totalActivos
                : totalInactivos
            : totalAll;
        const getQuery = `
      SELECT id, nombre, email, rol, COALESCE(activo, true) AS activo
      FROM public.usuario
      ${whereClause}
      ORDER BY nombre ASC LIMIT $2 OFFSET $3
    `;
        const getResult = await db.query(getQuery, queryParams);
        return res.status(200).json({
            status: "success",
            pagination: {
                totalRecords: currentTotal,
                totalPages: Math.ceil(currentTotal / limitNum) || 1,
                currentPage: pageNum,
                limit: limitNum,
                totals: {
                    all: totalAll,
                    activos: totalActivos,
                    inactivos: totalInactivos,
                },
            },
            data: getResult.rows || [],
        });
    }
    catch (error) {
        console.error("Error en getUsers:", error);
        return res
            .status(500)
            .json({ error: "Error al obtener usuarios", details: error === null || error === void 0 ? void 0 : error.message });
    }
};
// Obtener un usuario por id
export const getOneUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const getQuery = `
      SELECT id, nombre, email, rol, activo
      FROM public.usuario
      WHERE id = $1
    `;
        const getResult = await db.query(getQuery, [userId]);
        if (getResult.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        return res.status(200).json({
            status: "success",
            data: getResult.rows[0],
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al encontrar usuario" });
    }
};
// Actualizar datos del usuario (nombre y rol)
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { nombre, rol } = req.body;
        const updateQuery = `
      UPDATE public.usuario
      SET nombre = $1, rol = $2
      WHERE id = $3
      RETURNING *;
    `;
        const updateResult = await db.query(updateQuery, [nombre, rol, userId]);
        if (updateResult.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        // Opcionalmente actualizar metadata en Supabase Auth
        await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { nombre, rol },
        });
        return res.status(200).json({
            status: "success",
            response: "Usuario actualizado con éxito",
            data: updateResult.rows[0],
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al actualizar usuario" });
    }
};
// Actualizar contraseña del usuario
export const updateUserPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { password } = req.body;
        const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
            password,
        });
        if (authError) {
            return res.status(400).json({ error: authError.message });
        }
        return res.status(200).json({
            status: "success",
            response: "Contraseña actualizada con éxito",
        });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "Error al actualizar contraseña del usuario" });
    }
};
// Eliminar (Desactivar) usuario
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deleteQuery = `UPDATE public.usuario SET activo = false WHERE id = $1`;
        const deleteResult = await db.query(deleteQuery, [userId]);
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        return res.status(200).json({
            status: "success",
            response: "Usuario desactivado",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al desactivar usuario" });
    }
};
// Restaurar (Activar) usuario
export const restoreUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const restoreQuery = `UPDATE public.usuario SET activo = true WHERE id = $1`;
        const restoreResult = await db.query(restoreQuery, [userId]);
        if (restoreResult.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        return res.status(200).json({
            status: "success",
            response: "Usuario activado",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al activar usuario" });
    }
};
//# sourceMappingURL=user.controller.js.map