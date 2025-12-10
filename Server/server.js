import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import contactRoutes from "./routes/contactRoutes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/contact", contactRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT || 5000, () => console.log("Server started on port " + (process.env.PORT || 5000)));
