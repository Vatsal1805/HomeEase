const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.setupTransporter();
  }

  setupTransporter() {
    // For development/testing, use Ethereal Email if no real credentials are provided
    if (process.env.NODE_ENV === 'development' && (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD)) {
      console.log('📧 Using Ethereal Email for development testing...');
      this.setupEtherealEmail();
      return;
    }

    // Create transporter using Gmail SMTP or other email service
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_APP_PASSWORD // Your Gmail App Password
      }
    });

    console.log('📧 Using Gmail SMTP for email notifications');
  }

  async setupEtherealEmail() {
    try {
      // Create test account for development
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      console.log('📧 Using Ethereal Email for development');
      console.log('Test account created:', testAccount.user);
    } catch (error) {
      console.error('Error setting up Ethereal Email:', error);
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = '') {
    try {
      const mailOptions = {
        from: {
          name: 'HomeEase',
          address: process.env.EMAIL_USER || 'noreply@homeease.com'
        },
        to,
        subject,
        text: textContent,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email sent successfully');
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Email template for booking status updates
  generateBookingStatusEmail(booking, newStatus, customerName) {
    const statusMessages = {
      'pending': {
        subject: 'Booking Received - We\'ll Confirm Soon!',
        message: 'Your booking has been received and is being processed.',
        color: '#f59e0b'
      },
      'confirmed': {
        subject: 'Booking Confirmed - We\'re Coming!',
        message: 'Great news! Your booking has been confirmed.',
        color: '#10b981'
      },
      'in-progress': {
        subject: 'Service Started - We\'re On Our Way!',
        message: 'Our service provider is on the way to your location.',
        color: '#3b82f6'
      },
      'completed': {
        subject: 'Service Completed - Thank You!',
        message: 'Your service has been completed successfully.',
        color: '#10b981'
      },
      'cancelled': {
        subject: 'Booking Cancelled',
        message: 'Your booking has been cancelled.',
        color: '#ef4444'
      }
    };

    const statusInfo = statusMessages[newStatus] || statusMessages['pending'];
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; }
        .content { padding: 30px; }
        .status-badge { 
          display: inline-block; 
          padding: 8px 16px; 
          border-radius: 20px; 
          color: white; 
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
          background-color: ${statusInfo.color};
        }
        .booking-details { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .detail-label { font-weight: bold; color: #374151; }
        .detail-value { color: #6b7280; }
        .services-list { list-style: none; padding: 0; }
        .service-item { 
          background: white; 
          padding: 10px; 
          margin: 5px 0; 
          border-radius: 4px;
          border-left: 3px solid ${statusInfo.color};
        }
        .footer { background-color: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; }
        .cta-button {
          display: inline-block;
          background-color: ${statusInfo.color};
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏠 HomeEase</div>
          <p>Your Home Service Partner</p>
        </div>
        
        <div class="content">
          <h2>Hi ${customerName}! 👋</h2>
          <p>${statusInfo.message}</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span class="status-badge">${newStatus.replace('-', ' ')}</span>
          </div>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">${booking.bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Scheduled Date:</span>
              <span class="detail-value">${new Date(booking.scheduledDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Scheduled Time:</span>
              <span class="detail-value">${booking.scheduledTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value">₹${booking.pricing?.total || 'N/A'}</span>
            </div>
            
            <h4>Services:</h4>
            <ul class="services-list">
              ${booking.services.map(service => `
                <li class="service-item">
                  <strong>${service.service?.name || 'Service'}</strong>
                  <div>Quantity: ${service.quantity} | Price: ₹${service.price}</div>
                </li>
              `).join('')}
            </ul>
          </div>
          
          ${newStatus === 'completed' ? `
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/bookings" class="cta-button">
                Rate Your Experience
              </a>
            </div>
          ` : ''}
          
          ${newStatus === 'confirmed' ? `
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Our service provider will contact you before arriving</li>
              <li>Please ensure someone is available at the scheduled time</li>
              <li>Have the service area ready for our team</li>
            </ul>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Need help? Contact us at support@homeease.com or call +91-9999999999</p>
          <p>© 2025 HomeEase. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const textContent = `
    Hi ${customerName}!
    
    ${statusInfo.message}
    
    Booking Details:
    - Booking ID: ${booking.bookingId}
    - Status: ${newStatus.toUpperCase()}
    - Scheduled: ${new Date(booking.scheduledDate).toLocaleDateString()} at ${booking.scheduledTime}
    - Total: ₹${booking.pricing?.total || 'N/A'}
    
    Services:
    ${booking.services.map(service => `- ${service.service?.name || 'Service'} (Qty: ${service.quantity})`).join('\n')}
    
    Need help? Contact us at support@homeease.com
    
    Thank you for choosing HomeEase!
    `;

    return {
      subject: statusInfo.subject,
      html: htmlContent,
      text: textContent
    };
  }

  // Email template for service status updates (real-time updates)
  generateServiceStatusEmail(booking, newServiceStatus, customerName) {
    const statusMessages = {
      'not-started': {
        subject: 'Service Scheduled - We\'ll Be There Soon!',
        message: 'Your service is scheduled and our team is preparing.',
        icon: '📅'
      },
      'on-the-way': {
        subject: 'Service Provider On The Way!',
        message: 'Our service provider is on the way to your location.',
        icon: '🚗'
      },
      'in-progress': {
        subject: 'Service In Progress',
        message: 'Our team has arrived and is working on your service.',
        icon: '🔧'
      },
      'completed': {
        subject: 'Service Completed Successfully!',
        message: 'Your service has been completed successfully.',
        icon: '✅'
      },
      'cancelled': {
        subject: 'Service Cancelled',
        message: 'Your service has been cancelled.',
        icon: '❌'
      }
    };

    const statusInfo = statusMessages[newServiceStatus] || statusMessages['not-started'];
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 500px; margin: 0 auto; background-color: white; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; text-align: center; }
        .status-icon { font-size: 48px; margin: 20px 0; }
        .status-message { font-size: 18px; color: #374151; margin: 20px 0; }
        .booking-id { background: #f3f4f6; padding: 10px; border-radius: 4px; margin: 20px 0; }
        .footer { background-color: #f9fafb; padding: 15px; text-align: center; color: #6b7280; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🏠 HomeEase</h2>
          <p>Service Status Update</p>
        </div>
        
        <div class="content">
          <div class="status-icon">${statusInfo.icon}</div>
          <h3>Hi ${customerName}!</h3>
          <p class="status-message">${statusInfo.message}</p>
          
          <div class="booking-id">
            <strong>Booking ID:</strong> ${booking.bookingId}
          </div>
          
          ${newServiceStatus === 'on-the-way' ? `
            <p><strong>📍 Estimated Arrival:</strong> 15-30 minutes</p>
            <p>Please ensure someone is available to receive our service provider.</p>
          ` : ''}
          
          ${newServiceStatus === 'completed' ? `
            <p>We hope you're satisfied with our service!</p>
            <p>Your feedback means a lot to us.</p>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Track your service: ${process.env.FRONTEND_URL || 'http://localhost:3001'}/bookings</p>
          <p>Support: support@homeease.com | +91-9999999999</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const textContent = `
    HomeEase - Service Update
    
    Hi ${customerName}!
    
    ${statusInfo.message}
    
    Booking ID: ${booking.bookingId}
    Status: ${newServiceStatus.toUpperCase()}
    
    ${newServiceStatus === 'on-the-way' ? 'Estimated arrival: 15-30 minutes\nPlease be available to receive our service provider.' : ''}
    
    Track your service: ${process.env.FRONTEND_URL || 'http://localhost:3001'}/bookings
    Support: support@homeease.com
    `;

    return {
      subject: statusInfo.subject,
      html: htmlContent,
      text: textContent
    };
  }

  // Send booking status notification
  async sendBookingStatusNotification(booking, newStatus) {
    try {
      const customerEmail = booking.customerInfo?.email || booking.customer?.email;
      const customerName = booking.customerInfo?.firstName || booking.customer?.firstName || 'Customer';

      if (!customerEmail) {
        console.log('No customer email found for booking:', booking.bookingId);
        return { success: false, error: 'No customer email' };
      }

      const emailContent = this.generateBookingStatusEmail(booking, newStatus, customerName);
      
      return await this.sendEmail(
        customerEmail,
        emailContent.subject,
        emailContent.html,
        emailContent.text
      );
    } catch (error) {
      console.error('Error sending booking status notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send service status notification
  async sendServiceStatusNotification(booking, newServiceStatus) {
    try {
      const customerEmail = booking.customerInfo?.email || booking.customer?.email;
      const customerName = booking.customerInfo?.firstName || booking.customer?.firstName || 'Customer';

      if (!customerEmail) {
        console.log('No customer email found for booking:', booking.bookingId);
        return { success: false, error: 'No customer email' };
      }

      const emailContent = this.generateServiceStatusEmail(booking, newServiceStatus, customerName);
      
      return await this.sendEmail(
        customerEmail,
        emailContent.subject,
        emailContent.html,
        emailContent.text
      );
    } catch (error) {
      console.error('Error sending service status notification:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
