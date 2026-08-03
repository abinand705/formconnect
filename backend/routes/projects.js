const express = require("express");
const prisma = require("../db");
const auth = require("../middleware/auth");
const crypto = require("crypto");

const router = express.Router();

// Helper to generate API key
const generateApiKey = () => "fc_live_" + crypto.randomBytes(16).toString("hex");

// Create project
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Project name is required" });

    const apiKey = generateApiKey();
    const defaultFields = [
      { name: "name", type: "text", required: true },
      { name: "email", type: "email", required: true },
      { name: "message", type: "textarea", required: true }
    ];

    const project = await prisma.project.create({
      data: {
        name,
        apiKey,
        fields: defaultFields,
        userId: req.user.userId
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// List owner's projects
router.get("/", auth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Edit project (fields)
router.patch("/:id", auth, async (req, res) => {
  try {
    const { fields, name } = req.body;
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });

    if (!project || project.userId !== req.user.userId) {
      return res.status(404).json({ error: "Project not found" });
    }

    const data = {};
    if (name) data.name = name;
    if (fields) data.fields = fields;

    const updatedProject = await prisma.project.update({
      where: { id: req.params.id },
      data
    });

    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Regenerate API key
router.post("/:id/regenerate-key", auth, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });

    if (!project || project.userId !== req.user.userId) {
      return res.status(404).json({ error: "Project not found" });
    }

    const newApiKey = generateApiKey();
    const updatedProject = await prisma.project.update({
      where: { id: req.params.id },
      data: { apiKey: newApiKey }
    });

    res.json({ apiKey: updatedProject.apiKey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// List submissions for a project
router.get("/:id/submissions", auth, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });

    if (!project || project.userId !== req.user.userId) {
      return res.status(404).json({ error: "Project not found" });
    }

    const submissions = await prisma.submission.findMany({
      where: { projectId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
