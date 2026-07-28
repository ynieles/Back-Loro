import { type Request, type Response } from "express";
import * as db from "../config/db.js";
import bcrypt from "bcrypt";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { nombre, contrasena, rol = "admin" } = req.body;

    const checkQuery = `SELECT 1 FROM usuario WHERE nombre = $1`;
    const checkResult = await db.query(checkQuery, [nombre]);

    if (checkResult.rowCount && checkResult.rowCount > 0) {
      return res
        .status(409)
        .json({ error: "Usuario ya registrado con ese nombre" });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const createQuery = `INSERT INTO usuario (nombre, contrasena, rol) VALUES ($1, $2, $3) RETURNING *`;
    const createResult = await db.query(createQuery, [
      nombre,
      hashedPassword,
      rol,
    ]);

    res.status(202).json({
      status: "success",
      response: "Usuario creado con exito",
      data: createResult.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};
