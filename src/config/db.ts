import pg, { type QueryResult } from "pg";
import dotenv from "dotenv";
const { Pool } = pg;

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const query = (text: string, param?: any[]): Promise<QueryResult> => {
  return pool.query(text, param);
};
