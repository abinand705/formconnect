require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const submitRoutes = require("./routes/submit");
const submissionRoutes = require("./routes/submissions");
const analyticsRoutes = require("./routes/analytics");

const app = express();

app.set("trust proxy", 1);
const allowedOrigins = [
  "https://formconnect.vercel.app",
  "https://abinandes.vercel.app",
  "https://abinand.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim()) : [])
];

const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  // Public submission endpoint accepts submissions from any website using their API key
  if (req.path.startsWith("/api/submit") || req.url.startsWith("/api/submit")) {
    corsOptions = { origin: true };
  } else {
    corsOptions = {
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      }
    };
  }
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/submit", submitRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/stats", require("./routes/stats"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
