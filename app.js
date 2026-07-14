const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/database");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth.routes");
const estateRoutes = require("./routes/estate.routes");
const surveyRoutes = require("./routes/survey.routes");

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CRI Estate Management API Running",
  });
});

app.use("/api/auth", authRoutes);
// app.use("/api/estates", estateRoutes);
// app.use("/api/surveys", surveyRoutes);

const errorHandler = require("./middleware/error.middleware");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
