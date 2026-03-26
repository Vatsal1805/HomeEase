const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validateContact } = require('../middleware/validators/contactValidator');

// POST: Submit contact form
router.post('/', validateContact, contactController.submitContact);

module.exports = router;
