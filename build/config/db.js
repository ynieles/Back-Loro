import pg, {} from "pg";
import dotenv from "dotenv";
const { Pool } = pg;
dotenv.config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5432,
});
export const query = (text, param) => {
    return pool.query(text, param);
};
//# sourceMappingURL=db.js.map