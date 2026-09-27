const express = require("express");
const prisma = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

// GET all submissions across user's projects
router.get("/", auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    const where = {
      project: {
        userId: req.user.userId
      }
    };
    if (projectId) {
      where.projectId = projectId;
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            apiKey: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update read status for a single submission
router.patch("/:id", auth, async (req, res) => {
  try {
    const { read } = req.body;
    
    // First, verify the user owns the project this submission belongs to
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });

    if (!submission || submission.project.userId !== req.user.userId) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: req.params.id },
      data: { read: read !== undefined ? read : true }
    });

    res.json(updatedSubmission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark all submissions as read for the user
router.post("/mark-all-read", auth, async (req, res) => {
  try {
    const { projectId } = req.body || {};
    const where = {
      project: {
        userId: req.user.userId
      },
      read: false
    };
    if (projectId) {
      where.projectId = projectId;
    }

    const result = await prisma.submission.updateMany({
      where,
      data: { read: true }
    });

    res.json({ success: true, count: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a submission
router.delete("/:id", auth, async (req, res) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { project: true }
    });

    if (!submission || submission.project.userId !== req.user.userId) {
      return res.status(404).json({ error: "Submission not found" });
    }

    await prisma.submission.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: "Submission deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
