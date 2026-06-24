/**
 * Mail configuration loader
 * Validates and configures the environment variables required for the email system.
 */

const mailConfig = {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  receiver: process.env.EMAIL_RECEIVER || 'masud.dev01@gmail.com', // default support email
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true' // false for STARTTLS
};

const validateMailConfig = () => {
  if (!mailConfig.user) {
    console.warn('WARNING: EMAIL_USER is not defined in environment variables. Mailer will fail.');
    return false;
  }
  if (!mailConfig.pass) {
    console.warn('WARNING: EMAIL_PASS is not defined in environment variables. Mailer will fail.');
    return false;
  }
  return true;
};

module.exports = {
  mailConfig,
  validateMailConfig
};
