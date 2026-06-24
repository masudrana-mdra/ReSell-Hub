const nodemailer = require('nodemailer');
const { mailConfig, validateMailConfig } = require('../config/mail');

// Create reusable transporter object using the default SMTP transport
let transporter = null;

if (validateMailConfig()) {
  transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure, // true for 465, false for other ports
    auth: {
      user: mailConfig.user,
      pass: mailConfig.pass
    },
    tls: {
      rejectUnauthorized: false // Avoid SSL handshake errors on some servers
    }
  });
}

/**
 * Sends a contact inquiry message to the official platform support email.
 * @param {Object} data Message details
 * @param {string} data.name Sender's name
 * @param {string} data.email Sender's email address
 * @param {string} data.subject Message subject
 * @param {string} data.message Message content
 */
const sendContactEmail = async ({ name, email, subject, message }) => {
  if (!transporter) {
    console.warn('Mail transporter is not configured. Mocking email delivery.');
    return { success: true, mocked: true };
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #4f46e5; text-align: center; border-bottom: 2px solid #eeebff; padding-bottom: 10px;">New Contact Inquiry - ReSell Hub</h2>
      <p>You have received a new contact inquiry from the platform's Help Desk.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f0f0f0; width: 100px;">Sender Name:</td>
          <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Sender Email:</td>
          <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Subject:</td>
          <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${subject}</td>
        </tr>
      </table>

      <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #4f46e5;">
        <h4 style="margin: 0 0 10px 0; color: #374151;">Message:</h4>
        <p style="margin: 0; line-height: 1.5; color: #4b5563; font-style: italic;">"${message.replace(/\n/g, '<br />')}"</p>
      </div>

      <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 25px;">
        This email was sent automatically by the ReSell Hub server.
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"${name}" <${mailConfig.user}>`, // Gmail aliases the sender to the authenticated user
    to: mailConfig.receiver,
    replyTo: email,
    subject: `[ReSell Hub Helpdesk] ${subject}`,
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendContactEmail
};
