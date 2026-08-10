const express = require("express");
const router = express.Router();
const prisma = require("../db");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Fetch projects for user
    const projects = await prisma.project.findMany({
      where: { userId },
      select: { id: true, name: true }
    });

    const emptyDailyCounts = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      emptyDailyCounts.push({
        date: d.toISOString().split("T")[0],
        count: 0
      });
    }

    if (projects.length === 0) {
      return res.json({ dailyCounts: emptyDailyCounts, byProject: [] });
    }

    const projectIds = projects.map(p => p.id);
    const projectNameMap = projects.reduce((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {});

    // Fetch submissions
    const submissions = await prisma.submission.findMany({
      where: {
        projectId: { in: projectIds },
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { projectId: true, createdAt: true }
    });

    // Initialize daily counts map from the pre-generated empty list
    const dailyMap = {};
    emptyDailyCounts.forEach(entry => {
      dailyMap[entry.date] = 0;
    });

    // Initialize project counts map
    const projectMap = {};
    projects.forEach(p => {
      projectMap[p.id] = 0;
    });

    // Aggregate submissions
    submissions.forEach(sub => {
      const dateStr = sub.createdAt.toISOString().split("T")[0];
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr]++;
      }
      if (projectMap[sub.projectId] !== undefined) {
        projectMap[sub.projectId]++;
      }
    });

    const dailyCounts = Object.keys(dailyMap).sort().map(date => ({
      date,
      count: dailyMap[date]
    }));

    const byProject = Object.keys(projectMap).map(projectId => ({
      projectName: projectNameMap[projectId],
      count: projectMap[projectId]
    }));

    res.json({ dailyCounts, byProject });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;
