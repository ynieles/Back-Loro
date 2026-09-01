import { query } from "./db.js";

export const initDb = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS public.historial_bajas (
        id SERIAL PRIMARY KEY,
        entidad VARCHAR(50) NOT NULL,
        entidad_id INT NOT NULL,
        motivo TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabla historial_bajas verificada / creada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos (historial_bajas):", error);
  }
};
