import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT || '587');
  
  return nodemailer.createTransport({
    service: 'gmail', // Use Gmail service directly
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // Accept self-signed certificates
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

// Send contact form email
export const sendContactEmail = async ({ name, email, subject, message }) => {
  // Check if SMTP is properly configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP not configured - email sending disabled');
    return { success: true, message: 'Email service not configured' };
  }

  try {
    const transporter = createTransporter();

    // Email to admin
    const adminMailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #233a95; border-bottom: 2px solid #233a95; padding-bottom: 10px;">New Contact Form Submission</h2>
          
          <div style="margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This email was sent from the Flourisel contact form.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(adminMailOptions);

    // Auto-reply to customer
    const customerMailOptions = {
      from: `"Flourisel Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Thank you for contacting Flourisel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #233a95; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Flourisel</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #233a95;">Thank You for Reaching Out!</h2>
            
            <p style="line-height: 1.6; color: #333;">
              Dear ${name},
            </p>
            
            <p style="line-height: 1.6; color: #333;">
              We have received your message and will get back to you within 24 hours. 
              Our team is committed to helping you succeed in your reselling journey.
            </p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #233a95; margin: 20px 0;">
              <p style="margin: 0; color: #666;"><strong>Your Message:</strong></p>
              <p style="margin: 10px 0 0 0; color: #333;">${message}</p>
            </div>
            
            <p style="line-height: 1.6; color: #333;">
              In the meantime, feel free to explore our products and reseller program on our website.
            </p>
            
            <div style="margin: 30px 0; padding: 20px; background: white; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #233a95;">Contact Information</h3>
              <p style="margin: 5px 0; color: #333;">📧 Email: support@theFlourisel.com</p>
              <p style="margin: 5px 0; color: #333;">📱 Phone: +91 9461923285</p>
              <p style="margin: 5px 0; color: #333;">📍 Location: Jaipur, Rajasthan, India - 302001</p>
            </div>
            
            <p style="line-height: 1.6; color: #333;">
              Best regards,<br>
              <strong>Flourisel Team</strong>
            </p>
          </div>
          
          <div style="background: #233a95; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Flourisel. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(customerMailOptions);

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const transporter = createTransporter();
    const { orderId, shippingAddress, items, totalAmount, totalEarnings } = orderData;

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Flourisel" <${process.env.SMTP_USER}>`,
      to: shippingAddress.email || process.env.ADMIN_EMAIL,
      subject: `Order Confirmation - ${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #233a95; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0;">Order ID: ${orderId}</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="line-height: 1.6; color: #333;">
              Dear ${shippingAddress.name},
            </p>
            
            <p style="line-height: 1.6; color: #333;">
              Thank you for your order! We're getting your order ready to be shipped.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #233a95;">Shipping Address</h3>
              <p style="margin: 5px 0; color: #333;">${shippingAddress.name}</p>
              <p style="margin: 5px 0; color: #333;">${shippingAddress.address}</p>
              <p style="margin: 5px 0; color: #333;">${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}</p>
              <p style="margin: 5px 0; color: #333;">Phone: ${shippingAddress.phone}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #233a95;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 10px; text-align: left;">Product</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background: #f5f5f5; font-weight: bold;">
                    <td colspan="3" style="padding: 10px; text-align: right;">Total Amount:</td>
                    <td style="padding: 10px; text-align: right; color: #233a95;">₹${totalAmount.toLocaleString()}</td>
                  </tr>
                  <tr style="background: #e8f5e9;">
                    <td colspan="3" style="padding: 10px; text-align: right;">Your Earnings:</td>
                    <td style="padding: 10px; text-align: right; color: #2e7d32; font-weight: bold;">₹${totalEarnings.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <p style="line-height: 1.6; color: #333;">
              We'll send you a shipping confirmation email with tracking information once your order ships.
            </p>
            
            <p style="line-height: 1.6; color: #333;">
              Best regards,<br>
              <strong>Flourisel Team</strong>
            </p>
          </div>
          
          <div style="background: #233a95; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Flourisel. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Order confirmation email sent' };
  } catch (error) {
    console.error('Order confirmation email error:', error);
    // Don't throw error for email failures, just log them
    return { success: false, message: 'Failed to send confirmation email' };
  }
};

// Send OTP email for registration verification
export const sendOTPEmail = async (email, otp, name, purpose = 'registration') => {
  // Check if SMTP is properly configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP not configured - email sending disabled. Using default OTP: 000000');
    console.log(`📧 Would have sent OTP to ${email}: ${otp}`);
    return { success: true, message: 'Email service not configured - using default OTP 000000' };
  }

  try {
    const transporter = createTransporter();

    const purposeText = {
      registration: 'Email Verification',
      login: 'Login Verification',
      'forgot-password': 'Password Reset'
    };

    const messageText = {
      registration: 'You have requested to verify your email address for registration.',
      login: 'You have requested to login to your account.',
      'forgot-password': 'You have requested to reset your password.'
    };

    const mailOptions = {
      from: `"Flourisel" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${purposeText[purpose] || 'Verification'} - OTP`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #233a95; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Flourisel</h1>
            <p style="margin: 10px 0 0 0;">${purposeText[purpose] || 'Verification'}</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="line-height: 1.6; color: #333;">
              Dear ${name || 'User'},
            </p>
            
            <p style="line-height: 1.6; color: #333;">
              ${messageText[purpose] || 'You have requested to verify your account.'}
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your One-Time Password (OTP) is:</p>
              <div style="font-size: 32px; font-weight: bold; color: #233a95; letter-spacing: 5px; padding: 15px; background: #f5f5f5; border-radius: 5px; display: inline-block;">
                ${otp}
              </div>
              <p style="margin: 15px 0 0 0; color: #d32f2f; font-size: 14px;">
                ⏱ This OTP will expire in 10 minutes
              </p>
            </div>
            
            <div style="background: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
              <p style="margin: 0; color: #e65100; font-weight: bold;">⚠️ Security Notice:</p>
              <p style="margin: 10px 0 0 0; color: #333; font-size: 14px;">
                Never share this OTP with anyone. Flourisel will never ask for your OTP via phone or email.
              </p>
            </div>
            
            <p style="line-height: 1.6; color: #666; font-size: 14px;">
              If you did not request this OTP, please ignore this email or contact our support team immediately.
            </p>
            
            <p style="line-height: 1.6; color: #333;">
              Best regards,<br>
              <strong>Flourisel Team</strong>
            </p>
          </div>
          
          <div style="background: #233a95; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Flourisel. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'OTP email sent successfully' };
  } catch (error) {
    console.error('OTP email sending error:', error);
    throw new Error('Failed to send OTP email: ' + error.message);
  }
};
