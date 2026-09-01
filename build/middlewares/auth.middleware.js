import { supabase } from "../config/supabaseClient.js";
import * as db from "../config/db.js";
export const authMiddleware = async (req, res, next) => {
    var _a, _b, _c, _d;
    let token;
    if ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return res.status(401).json({ error: "No ha iniciado sesión" });
    }
    try {
        const { data: { user }, error, } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res
                .status(401)
                .json({ error: "Token inválido o sesión expirada" });
        }
        const authQuery = "SELECT id, email, nombre, rol FROM public.usuario WHERE id = $1";
        let authResult = await db.query(authQuery, [user.id]);
        let currentUser = authResult.rows[0];
        if (!currentUser) {
            // Asegurar que la columna 'activo' exista
            await db.query(`ALTER TABLE public.usuario ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;`);
            const name = ((_b = user.user_metadata) === null || _b === void 0 ? void 0 : _b.nombre) || ((_c = user.email) === null || _c === void 0 ? void 0 : _c.split("@")[0]) || "Usuario";
            const role = ((_d = user.user_metadata) === null || _d === void 0 ? void 0 : _d.rol) || "user";
            const insertQuery = `
        INSERT INTO public.usuario (id, email, nombre, rol, activo)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
        RETURNING id, email, nombre, rol;
      `;
            const insertResult = await db.query(insertQuery, [
                user.id,
                user.email,
                name,
                role,
            ]);
            currentUser = insertResult.rows[0];
        }
        req.user = currentUser;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Error al validar la sesión" });
    }
};
//# sourceMappingURL=auth.middleware.js.map