import type { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabaseClient.js";
import * as db from "../config/db.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "No ha iniciado sesión" });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res
        .status(401)
        .json({ error: "Token inválido o sesión expirada" });
    }

    const authQuery =
      "SELECT id, email, nombre, rol FROM public.usuario WHERE id = $1";
    let authResult = await db.query(authQuery, [user.id]);
    let currentUser = authResult.rows[0];

    if (!currentUser) {
      // Asegurar que la columna 'activo' exista
      await db.query(
        `ALTER TABLE public.usuario ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;`,
      );

      const name =
        user.user_metadata?.nombre || user.email?.split("@")[0] || "Usuario";
      const role = user.user_metadata?.rol || "user";

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

    (req as any).user = currentUser;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Error al validar la sesión" });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !user.rol) {
      return res
        .status(403)
        .json({ error: "Acceso denegado. No se encontró un rol asignado al usuario." });
    }

    const userRoleLower = user.rol.toLowerCase().trim();
    const hasAccess = allowedRoles.some(
      (role) => role.toLowerCase().trim() === userRoleLower,
    );

    if (!hasAccess) {
      return res.status(403).json({
        error: "Acceso denegado. No tienes permisos para realizar esta acción.",
      });
    }

    next();
  };
};

