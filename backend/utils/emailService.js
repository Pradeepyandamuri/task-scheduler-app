const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // = yandamuripradeep@gmail.com
    pass: process.env.EMAIL_PASS, // = zbrjniydagyhzlwj (App password)
  },
});

/**
 * Send reminder email
 */
const sendReminderEmail = (to, subject, text) => {
  const mailOptions = {
    from: `"Task Scheduler" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions)
    .then(info => {
      console.log("✅ Email sent:", info.response);
    })
    .catch(err => {
      console.error("❌ Email sending failed:", err.message);
    });
};

module.exports = sendReminderEmail;
