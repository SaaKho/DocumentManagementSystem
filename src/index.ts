import express from "express";
import authRoutes from "./routes/authRoutes";
import documentRoutes from "./routes/documentRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/documents", documentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
