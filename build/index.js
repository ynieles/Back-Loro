import express from "express";
import empleadosRouter from "./routes/empleados.route.js";
import departamentoRouter from "./routes/departamentos.route.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = 3000;
app.use(express.json());
app.use("/api/empleado", empleadosRouter);
app.use("/api/departamento", departamentoRouter);
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
//# sourceMappingURL=index.js.map