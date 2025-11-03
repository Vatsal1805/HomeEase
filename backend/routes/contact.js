// const express = require('express');const express = require('express');const express = require('express');const express = require('express');

// const router = express.Router();

// const Contact = require('../models/Contact');const router = express.Router();

// const rateLimit = require('express-rate-limit');

// const Contact = require('../models/Contact');const router = express.Router();const router = express.Router();

// const contactRateLimit = rateLimit({

//   windowMs: 15 * 60 * 1000,const { auth, adminAuth } = require('../middleware/auth');

//   max: 3,

//   message: {const rateLimit = require('express-rate-limit');const Contact = require('../models/Contact');const Contact = require('../models/Contact');

//     success: false,

//     message: 'Too many contact submissions. Please try again later.'

//   }

// });// Rate limiting for contact form submissionsconst { auth, adminAuth } = require('../middleware/auth');const { auth, adminAuth } = require('../middleware/auth');



// router.post('/', contactRateLimit, async (req, res) => {const contactRateLimit = rateLimit({

//   try {

//     const { name, email, phone, subject, message } = req.body;  windowMs: 15 * 60 * 1000, // 15 minutesconst rateLimit = require('express-rate-limit');const rateLimit = require('express-rate-limit');



//     if (!name || !email || !subject || !message) {  max: 3, // limit each IP to 3 requests per windowMs

//       return res.status(400).json({

//         success: false,  message: {

//         message: 'Please fill in all required fields'

//       });    success: false,

//     }

//     message: 'Too many contact submissions. Please try again later.'// Rate limiting for contact form submissions// Rate limiting for contact form submissions

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!emailRegex.test(email)) {  }

//       return res.status(400).json({

//         success: false,});const contactRateLimit = rateLimit({const contactRateLimit = rateLimit({

//         message: 'Please provide a valid email address'

//       });

//     }

// // @route   POST /api/contact  windowMs: 15 * 60 * 1000, // 15 minutes  windowMs: 15 * 60 * 1000, // 15 minutes

//     const newContact = new Contact({

//       name: name.trim(),// @desc    Submit contact form

//       email: email.trim().toLowerCase(),

//       phone: phone ? phone.trim() : undefined,// @access  Public  max: 3, // limit each IP to 3 requests per windowMs  max: 3, // limit each IP to 3 requests per windowMs

//       subject: subject.trim(),

//       message: message.trim(),router.post('/', contactRateLimit, async (req, res) => {

//       submittedAt: new Date(),

//       status: 'new'  try {  message: {  message: {

//     });

//     const { name, email, phone, subject, message } = req.body;

//     await newContact.save();

//     success: false,    success: false,

//     res.status(201).json({

//       success: true,    // Validation

//       message: 'Contact form submitted successfully!',

//       data: {    if (!name || !email || !subject || !message) {    message: 'Too many contact submissions. Please try again later.'    message: 'Too many contact submissions. Please try again later.'

//         id: newContact._id,

//         submittedAt: newContact.submittedAt      return res.status(400).json({

//       }

//     });        success: false,  }  }



//   } catch (error) {        message: 'Please fill in all required fields (name, email, subject, message)'

//     console.error('Contact form error:', error);

//     res.status(500).json({      });});});

//       success: false,

//       message: 'Internal server error'    }

//     });

//   }

// });

//     // Email validation

// module.exports = router;
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;// @route   POST /api/contact// @route   POST /api/contact

//     if (!emailRegex.test(email)) {

//       return res.status(400).json({// @desc    Submit contact form// @desc    Submit contact form

//         success: false,

//         message: 'Please provide a valid email address'// @access  Public// @access  Public

//       });

//     }router.post('/', contactRateLimit, async (req, res) => {router.post('/', contactRateLimit, async (req, res) => {



//     // Phone validation (optional field)  try {  try {

//     if (phone) {

//       const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;    const { name, email, phone, subject, message } = req.body;    const { name, email, phone, subject, message } = req.body;

//       if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {

//         return res.status(400).json({

//           success: false,

//           message: 'Please provide a valid phone number'    // Validation    // Validation

//         });

//       }    if (!name || !email || !subject || !message) {    if (!name || !email || !subject || !message) {

//     }

//       return res.status(400).json({      return res.status(400).json({

//     // Create new contact submission

//     const newContact = new Contact({        success: false,        success: false,

//       name: name.trim(),

//       email: email.trim().toLowerCase(),        message: 'Please fill in all required fields (name, email, subject, message)'        message: 'Please fill in all required fields (name, email, subject, message)'

//       phone: phone ? phone.trim() : undefined,

//       subject: subject.trim(),      });      });

//       message: message.trim(),

//       submittedAt: new Date(),    }    }

//       status: 'new'

//     });



//     await newContact.save();    // Email validation    // Email validation



//     res.status(201).json({    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//       success: true,

//       message: 'Contact form submitted successfully! We will get back to you soon.',    if (!emailRegex.test(email)) {    if (!emailRegex.test(email)) {

//       data: {

//         id: newContact._id,      return res.status(400).json({      return res.status(400).json({

//         submittedAt: newContact.submittedAt

//       }        success: false,        success: false,

//     });

//         message: 'Please provide a valid email address'        message: 'Please provide a valid email address'

//   } catch (error) {

//     console.error('Contact form submission error:', error);      });      });

//     res.status(500).json({

//       success: false,    }    }

//       message: 'Internal server error. Please try again later.'

//     });

//   }

// });    // Phone validation (optional field)    // Phone validation (optional field)



// module.exports = router;    if (phone) {    if (phone) {

//       const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

//       if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {      if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {

//         return res.status(400).json({        return res.status(400).json({

//           success: false,          success: false,

//           message: 'Please provide a valid phone number'          message: 'Please provide a valid phone number'

//         });        });

//       }      }

//     }    }



//     // Create new contact submission    // Create new contact submission

//     const newContact = new Contact({    const newContact = new Contact({

//       name: name.trim(),      name: name.trim(),

//       email: email.trim().toLowerCase(),      email: email.trim().toLowerCase(),

//       phone: phone ? phone.trim() : undefined,      phone: phone ? phone.trim() : undefined,

//       subject: subject.trim(),      subject: subject.trim(),

//       message: message.trim(),      message: message.trim(),

//       submittedAt: new Date(),      submittedAt: new Date(),

//       status: 'new'      status: 'new'

//     });    });



//     await newContact.save();    await newContact.save();



//     res.status(201).json({    res.status(201).json({

//       success: true,      success: true,

//       message: 'Contact form submitted successfully! We will get back to you soon.',      message: 'Contact form submitted successfully! We will get back to you soon.',

//       data: {      data: {

//         id: newContact._id,        id: newContact._id,

//         submittedAt: newContact.submittedAt        submittedAt: newContact.submittedAt

//       }      }

//     });    });



//   } catch (error) {  } catch (error) {

//     console.error('Contact form submission error:', error);    console.error('Contact form submission error:', error);

//     res.status(500).json({    res.status(500).json({

//       success: false,      success: false,

//       message: 'Internal server error. Please try again later.'      message: 'Internal server error. Please try again later.'

//     });    });

//   }  }

// });});



// // @route   GET /api/contact// @route   GET /api/contact

// // @desc    Get all contact submissions (Admin only)// @desc    Get all contact submissions (Admin only)

// // @access  Private (Admin)// @access  Private (Admin)

// router.get('/', adminAuth, async (req, res) => {router.get('/', adminAuth, async (req, res) => {

//   try {  try {

//     const page = parseInt(req.query.page) || 1;    const page = parseInt(req.query.page) || 1;

//     const limit = parseInt(req.query.limit) || 10;    const limit = parseInt(req.query.limit) || 10;

//     const status = req.query.status;    const status = req.query.status;

//     const search = req.query.search;    const search = req.query.search;



//     // Build query    // Build query

//     let query = {};    let query = {};

//     if (status && ['new', 'in-progress', 'resolved', 'closed'].includes(status)) {    if (status && ['new', 'in-progress', 'resolved', 'closed'].includes(status)) {

//       query.status = status;      query.status = status;

//     }    }

//     if (search) {    if (search) {

//       query.$or = [      query.$or = [

//         { name: { $regex: search, $options: 'i' } },        { name: { $regex: search, $options: 'i' } },

//         { email: { $regex: search, $options: 'i' } },        { email: { $regex: search, $options: 'i' } },

//         { subject: { $regex: search, $options: 'i' } }        { subject: { $regex: search, $options: 'i' } }

//       ];      ];

//     }    }



//     const skip = (page - 1) * limit;    const skip = (page - 1) * limit;



//     const contacts = await Contact.find(query)    const contacts = await Contact.find(query)

//       .sort({ submittedAt: -1 })      .sort({ submittedAt: -1 })

//       .skip(skip)      .skip(skip)

//       .limit(limit)      .limit(limit)

//       .select('-__v');      .select('-__v');



//     const total = await Contact.countDocuments(query);    const total = await Contact.countDocuments(query);



//     res.json({    res.json({

//       success: true,      success: true,

//       data: {      data: {

//         contacts,        contacts,

//         pagination: {        pagination: {

//           page,          page,

//           limit,          limit,

//           total,          total,

//           pages: Math.ceil(total / limit)          pages: Math.ceil(total / limit)

//         }        }

//       }      }

//     });    });



//   } catch (error) {  } catch (error) {

//     console.error('Get contacts error:', error);    console.error('Get contacts error:', error);

//     res.status(500).json({    res.status(500).json({

//       success: false,      success: false,

//       message: 'Internal server error'      message: 'Internal server error'

//     });    });

//   }  }

// });});



// // @route   GET /api/contact/:id// @route   GET /api/contact/:id

// // @desc    Get single contact submission (Admin only)// @desc    Get single contact submission (Admin only)

// // @access  Private (Admin)// @access  Private (Admin)

// router.get('/:id', adminAuth, async (req, res) => {router.get('/:id', adminAuth, async (req, res) => {

//   try {  try {

//     const contact = await Contact.findById(req.params.id).select('-__v');    const contact = await Contact.findById(req.params.id).select('-__v');



//     if (!contact) {    if (!contact) {

//       return res.status(404).json({      return res.status(404).json({

//         success: false,        success: false,

//         message: 'Contact submission not found'        message: 'Contact submission not found'

//       });      });

//     }    }



//     res.json({    res.json({

//       success: true,      success: true,

//       data: contact      data: contact

//     });    });



//   } catch (error) {  } catch (error) {

//     console.error('Get contact error:', error);    console.error('Get contact error:', error);

//     res.status(500).json({    res.status(500).json({

//       success: false,      success: false,

//       message: 'Internal server error'      message: 'Internal server error'

//     });    });

//   }  }

// });});



// // @route   PUT /api/contact/:id// @route   PUT /api/contact/:id

// // @desc    Update contact submission status (Admin only)// @desc    Update contact submission status (Admin only)

// // @access  Private (Admin)// @access  Private (Admin)

// router.put('/:id', adminAuth, async (req, res) => {router.put('/:id', adminAuth, async (req, res) => {

//   try {  try {

//     const { status, adminNotes } = req.body;    const { status, adminNotes } = req.body;



//     // Validate status    // Validate status

//     if (!status || !['new', 'in-progress', 'resolved', 'closed'].includes(status)) {    if (!status || !['new', 'in-progress', 'resolved', 'closed'].includes(status)) {

//       return res.status(400).json({      return res.status(400).json({

//         success: false,        success: false,

//         message: 'Invalid status. Must be one of: new, in-progress, resolved, closed'        message: 'Invalid status. Must be one of: new, in-progress, resolved, closed'

//       });      });

//     }    }



//     const updateData = {    const updateData = {

//       status,      status,

//       updatedAt: new Date(),      updatedAt: new Date(),

//       updatedBy: req.user.id      updatedBy: req.user.id

//     };    };



//     if (adminNotes) {    if (adminNotes) {

//       updateData.adminNotes = adminNotes.trim();      updateData.adminNotes = adminNotes.trim();

//     }    }



//     const contact = await Contact.findByIdAndUpdate(    const contact = await Contact.findByIdAndUpdate(

//       req.params.id,      req.params.id,

//       updateData,      updateData,

//       { new: true, runValidators: true }      { new: true, runValidators: true }

//     ).select('-__v');    ).select('-__v');



//     if (!contact) {    if (!contact) {

//       return res.status(404).json({      return res.status(404).json({

//         success: false,        success: false,

//         message: 'Contact submission not found'        message: 'Contact submission not found'

//       });      });

//     }    }



//     res.json({    res.json({

//       success: true,      success: true,

//       message: 'Contact submission updated successfully',      message: 'Contact submission updated successfully',

//       data: contact      data: contact

//     });    });



//   } catch (error) {  } catch (error) {

//     console.error('Update contact error:', error);    console.error('Update contact error:', error);

//     res.status(500).json({    res.status(500).json({

//       success: false,      success: false,

//       message: 'Internal server error'      message: 'Internal server error'

//     });    });

//   }  }

// });});



// // @route   DELETE /api/contact/:id// @route   DELETE /api/contact/:id

// // @desc    Delete contact submission (Admin only)// @desc    Delete contact submission (Admin only)

// // @access  Private (Admin)// @access  Private (Admin)

// router.delete('/:id', adminAuth, async (req, res) => {router.delete('/:id', adminAuth, async (req, res) => {

//   try {  try {

//     const contact = await Contact.findByIdAndDelete(req.params.id);    const contact = await Contact.findByIdAndDelete(req.params.id);



//     if (!contact) {    if (!contact) {

//       return res.status(404).json({      return res.status(404).json({

//         success: false,        success: false,

//         message: 'Contact submission not found'        message: 'Contact submission not found'

//       });      });

//     }    }



//     res.json({    res.json({

//       success: true,      success: true,

//       message: 'Contact submission deleted successfully'      message: 'Contact submission deleted successfully'

//     });    });



//   } catch (error) {  } catch (error) {

//     console.error('Delete contact error:', error);    console.error('Delete contact error:', error);

//     res.status(500).json({    res.status(500).json({

//       success: false,      success: false,

//       message: 'Internal server error'      message: 'Internal server error'

//     });    });

//   }  }

// });});



// module.exports = router;module.exports = router;
