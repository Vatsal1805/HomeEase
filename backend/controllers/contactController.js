const Contact = require('../models/Contact');

const contactController = {
  // Submit contact form
  submitContact: async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      // Create new contact entry
      const contact = new Contact({
        name,
        email,
        phone: phone || null,
        subject,
        message
      });

      await contact.save();

      res.status(201).json({
        success: true,
        message: 'Contact message saved successfully',
        data: contact
      });
    } catch (error) {
      console.error('Contact submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save contact message',
        error: error.message
      });
    }
  }
};

module.exports = contactController;
