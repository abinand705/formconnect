const express = require("express");
const prisma = require("../db");
const { submitLimiter } = require("../middleware/rateLimit");
const { sendMail } = require("../utils/mailer");

const router = express.Router();

router.post("/", submitLimiter, async (req, res) => {
  try {
    const { apiKey, data, honeypot } = req.body;

    // Honeypot check
    if (honeypot) {
      // If honeypot is filled, it's a bot. Silently return success to trick the bot.
      return res.json({ success: true, message: "Submission successful" });
    }

    // 1. Basic check
    if (!apiKey || !data) {
      return res.status(400).json({ error: "apiKey and data are required" });
    }

    // 2. Look up project by API key, include user to get their email
    const project = await prisma.project.findUnique({ 
      where: { apiKey },
      include: { user: true }
    });
    
    if (!project) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // 3. Validate required fields against project's schema
    const fields = project.fields;
    const missing = fields
      .filter(f => f.required && !data[f.name])
      .map(f => f.name);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }

    // 4. Save submission
    const submission = await prisma.submission.create({
      data: {
        projectId: project.id,
        data,
      },
    });

    // 5. Send Email Notification
    try {
      const emailSubject = `New submission on ${project.name}`;
      
      let emailData = data;
      if (project.emailFields && Array.isArray(project.emailFields)) {
        emailData = {};
        for (const field of project.emailFields) {
          if (data[field] !== undefined) {
            emailData[field] = data[field];
          }
        }
      }

      const emailBody = `You have a new submission for ${project.name}:\n\n` + 
        Object.entries(emailData).map(([key, val]) => `${key}: ${val}`).join('\n');
      
      await sendMail(project.user.email, emailSubject, emailBody);
    } catch (emailError) {
      // Log the email error but DO NOT fail the request
      console.error("Failed to send notification email:", emailError);
    }

    // 6. Respond
    res.json({ success: true, id: submission.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
