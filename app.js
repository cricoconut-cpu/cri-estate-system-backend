import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import connectDB from "./config/database.js";
import errorHandler from "./middleware/error.middleware.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import estateRoutes from "./routes/estate.routes.js";
// import surveyRoutes from "./routes/survey.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CRI Estate Management API Running",
  });
});

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/estates", estateRoutes);
// app.use("/api/surveys", surveyRoutes);

// Error Handling Middleware (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});