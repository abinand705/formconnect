const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body text
 */
const sendMail = async (to, subject, text) => {
  try {
    const info = await resend.emails.send({
      from: 'FormConnect <onboarding@resend.dev>',
      to,
      subject,
      text,
    });
    console.log("Email sent:", info);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendMail };
