const pool = require("./config/db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "AI Study Buddy Backend Running",
  });
});
const PORT = process.env.PORT || 5000;
pool
  .connect()
  .then(() => {
    console.log("PostgreSQL Connected Successfully");
  })
  .catch((err) => {
    console.error("Database Connection Error:", err.message);
  });
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const notesRoutes = require("./routes/notesRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notes", notesRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
