const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendContactEmail } = require('../utils/mailer');

// @route   POST /api/contact
// @desc    Receive, store, and send contact inquiry email
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // 1. Basic validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your name' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a subject' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    // 2. Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    // 3. Extract IP address
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    // 4. Save message to database
    const contactMsg = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress
    });
    await contactMsg.save();

    // 5. Send SMTP email
    try {
      await sendContactEmail({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim()
      });
    } catch (mailError) {
      // Log the mail error but don't fail the request completely since database backup succeeded
      console.error('SMTP email dispatch failed:', mailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Your inquiry has been successfully sent to ReSell Hub support.'
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ success: false, message: 'Server error while processing contact inquiry' });
  }
});

module.exports = router;
