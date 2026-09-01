import type { Request, Response } from "express";
import * as db from "../config/db.js";
import dotenv from "dotenv";
import { supabase } from "../config/supabaseClient.js";

dotenv.config();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    consloe.log(error)
    return res.status(400).json({ error: error.message });
  }

  const userId = data.user.id;

  try {
    const userQuery = `SELECT * FROM public.usuario WHERE id = $1`;
    const userResult = await db.query(userQuery, [userId]);

    return res.json({
      status: "success",
      token: data.session.access_token,
      data: userResult.rows[0],
    });
  } catch (error: any) {
    console.log(error)
    return res
      .status(500)
      .json({ error: "Error al obtener el perfil del usuario" });
  }
};
