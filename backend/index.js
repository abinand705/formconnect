require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const submitRoutes = require("./routes/submit");
const submissionRoutes = require("./routes/submissions");

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/submit", submitRoutes);
app.use("/api/submissions", submissionRoutes);
app.use(cors({ origin: "https://abinandes.vercel.app" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
