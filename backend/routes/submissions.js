const express = require("express");
const prisma = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

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

module.exports = router;
