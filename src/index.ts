import express from "express";
import empleadosRouter from "./routes/employee.route.js";
import departamentoRouter from "./routes/department.route.js";
import assignmentRouter from "./routes/assignment.route.js";
import roleRouter from "./routes/role.route.js";
import categoryRouter from "./routes/category.route.js";
import deviceRouter from "./routes/device.route.js";
import userRouter from "./routes/user.route.js";
import dotenv from "dotenv";
import { loginMiddleware } from "./middlewares/login.middleware.js";
import { login } from "./controllers/login.controller.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import cors from "cors";
import { initDb } from "./config/initDb.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://front-loro.vercel.app",
    credentials: true
  }),
);
app.use(express.json());
app.use(helmet());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos fallidos. Intente más tarde." },
});

app.use("/api/login", loginLimiter, loginMiddleware, login);

app.use("/api/user", userRouter);

app.use(authMiddleware);

app.use("/api/employee", empleadosRouter);

app.use("/api/department", departamentoRouter);

app.use("/api/assignment", assignmentRouter);

app.use("/api/role", roleRouter);

app.use("/api/category", categoryRouter);

app.use("/api/device", deviceRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, async () => {
  await initDb();
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
