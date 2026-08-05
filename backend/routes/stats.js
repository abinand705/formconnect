const express = require("express");
const prisma = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalProjects = await prisma.project.count({
      where: { userId }
    });

    const totalSubmissions = await prisma.submission.count({
      where: {
        project: {
          userId
        }
      }
    });

    const lastSubmission = await prisma.submission.findFirst({
      where: {
        project: {
          userId
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      totalProjects,
      totalSubmissions,
      lastActivity: lastSubmission ? lastSubmission.createdAt : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
