const sendMail = async (to, subject, text) => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'FormConnect', email: 'specmatch.project@gmail.com' },
        to: [{ email: to }],
        subject: subject,
        textContent: text
      })
    });
    const data = await response.json();
    console.log("Email sent:", data);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendMail };
