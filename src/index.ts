import express from "express";
import empleadosRouter from "./routes/employee.route.js";
import departamentoRouter from "./routes/department.route.js";
import assignmentRouter from "./routes/assignment.route.js";
import roleRouter from "./routes/role.route.js";
import categoryRouter from "./routes/category.route.js";
import deviceRouter from "./routes/device.route.js";
import userRouter from "./routes/user.route.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/usuario");

app.use("/api/empleado", empleadosRouter);

app.use("/api/departamento", departamentoRouter);

app.use("/api/asignacion", assignmentRouter);

app.use("/api/rol", roleRouter);

app.use("/api/categoria", categoryRouter);

app.use("/api/equipo", deviceRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
