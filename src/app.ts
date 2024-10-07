import express from "express";
import authRoutes from "./routes/users/authRoutes";
import documentRoutes from "./routes/document/documentRoutes";
import tagRoutes from "./routes/document/tagRoutes";
import downloadRoutes from "./routes/document/downloadRoutes";
import searchRoute from "./routes/document/searchRoute";
import permissionRoutes from "./routes/users/permissionRoutes";
import paginationRoutes from "./routes/document/paginationRoutes";

const createApp = () => {
  const app = express();

  // Middleware
  app.use(express.json());

  // Routes
  app.use("/api/users", authRoutes);
  app.use("/api/documents", documentRoutes);
  app.use("/api/tags", tagRoutes);
  app.use("/api/download", downloadRoutes);
  app.use("/api/search", searchRoute);
  app.use("/api/documents", permissionRoutes);
  app.use("/api/pagination", paginationRoutes);

  return app;
};

export default createApp;
