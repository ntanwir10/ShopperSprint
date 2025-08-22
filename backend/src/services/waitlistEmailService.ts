import { createTransport } from 'nodemailer';

// Email configuration from environment variables
const getSmtpConfig = () => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const getFromEmail = () => process.env.SMTP_FROM || 'ShopperSprint <noreply@shoppersprint.com>';
const getBaseUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

// Create reusable transporter object using SMTP transport
let transporter: any = null;
let initializationAttempted = false;

const initializeTransporter = () => {
  if (initializationAttempted) {
    return transporter;
  }
  
  initializationAttempted = true;
  
  console.log('🔧 Attempting to initialize waitlist email service...');
  console.log('📧 SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
  console.log('📧 SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  Waitlist email service disabled: SMTP credentials not configured');
    return null;
  }

  try {
    const config = getSmtpConfig();
    transporter = createTransport(config);
    console.log('📧 Waitlist email service initialized successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to initialize waitlist email service:', error);
    return null;
  }
};

// Generate email template
const generateEmailTemplate = (content: {
  title: string;
  heading: string;
  message: string;
  email: string;
  unsubscribeToken?: string;
  isWelcome?: boolean;
}) => {
  const unsubscribeUrl = content.unsubscribeToken 
    ? `${getBaseUrl()}/unsubscribe?token=${content.unsubscribeToken}`
    : null;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${content.title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background: white; border-radius: 15px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
          <h1 style="color: #2563eb; font-size: 2.5em; margin-bottom: 10px; font-weight: bold;">🛒 ShopperSprint</h1>
          <p style="color: #666; font-size: 1.2em; margin: 0;">Canada's Smartest Price Comparison Platform</p>
        </div>
        
        <!-- Main Content -->
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%); padding: 30px; border-radius: 15px; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 1.8em;">${content.heading}</h2>
          <div style="font-size: 1.1em; margin-bottom: 20px;">
            ${content.message}
          </div>
          
          ${content.isWelcome ? `
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #2563eb; margin-top: 0;">What to expect:</h3>
            <ul style="padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 8px;">🇨🇦 Compare prices across 500+ Canadian retailers</li>
              <li style="margin-bottom: 8px;">📊 Real-time price tracking and history</li>
              <li style="margin-bottom: 8px;">🔔 Instant price drop alerts</li>
              <li style="margin-bottom: 8px;">💰 Exclusive launch deals and early access</li>
            </ul>
          </div>
          ` : ''}
        </div>
        
        ${content.isWelcome ? `
        <div style="background: #f9fafb; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
          <h3 style="color: #1f2937; margin-top: 0;">📅 Launch Timeline</h3>
          <p style="font-size: 1.1em; margin-bottom: 15px;">
            <strong>Expected Launch:</strong> Q2 2025
          </p>
          <p style="color: #666; margin: 0;">
            We're working hard to bring you the best price comparison experience in Canada. 
            You'll be among the first to know when we launch!
          </p>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 0.9em; margin-bottom: 15px;">
            ${content.isWelcome ? 'Stay tuned for updates and exclusive previews!' : 'Thank you for your interest in ShopperSprint!'}<br>
            <strong>The ShopperSprint Team</strong>
          </p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="color: #666; font-size: 0.8em; margin: 0 0 10px 0;">
              This email was sent to <strong>${content.email}</strong> because you joined our waitlist at shoppersprint.com
            </p>
            ${unsubscribeUrl ? `
            <p style="color: #666; font-size: 0.8em; margin: 0;">
              Don't want to receive these emails? 
              <a href="${unsubscribeUrl}" style="color: #dc2626; text-decoration: underline;">Unsubscribe here</a>
            </p>
            ` : ''}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendWaitlistWelcomeEmail = async (email: string, unsubscribeToken: string): Promise<boolean> => {
  const emailTransporter = initializeTransporter();
  
  if (!emailTransporter) {
    console.log('📧 Waitlist email service not available, skipping welcome email for:', email);
    return false;
  }

  try {
    const htmlContent = generateEmailTemplate({
      title: 'Welcome to ShopperSprint!',
      heading: '🎉 You\'re In!',
      message: `
        <p>Thanks for joining our waitlist! You're now part of an exclusive group that will get early access to Canada's most advanced price comparison platform.</p>
      `,
      email,
      unsubscribeToken,
      isWelcome: true
    });

    const textContent = `
🎉 Welcome to the ShopperSprint Waitlist!

Thanks for joining our waitlist! You're now part of an exclusive group that will get early access to Canada's most advanced price comparison platform.

What to expect:
• Compare prices across 500+ Canadian retailers
• Real-time price tracking and history  
• Instant price drop alerts
• Exclusive launch deals and early access

Launch Timeline: Q2 2025

We're working hard to bring you the best price comparison experience in Canada. You'll be among the first to know when we launch!

Stay tuned for updates and exclusive previews!
The ShopperSprint Team

This email was sent to ${email} because you joined our waitlist at shoppersprint.com
Unsubscribe: ${getBaseUrl()}/unsubscribe?token=${unsubscribeToken}
    `;

    const mailOptions = {
      from: getFromEmail(),
      to: email,
      subject: '🎉 Welcome to the ShopperSprint Waitlist!',
      html: htmlContent,
      text: textContent,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('📧 Welcome email sent successfully to:', email, 'MessageID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send welcome email to:', email, error);
    return false;
  }
};

export const sendTestEmail = async (email: string): Promise<boolean> => {
  const emailTransporter = initializeTransporter();
  
  if (!emailTransporter) {
    console.log('📧 Waitlist email service not available for test email to:', email);
    return false;
  }

  try {
    const htmlContent = generateEmailTemplate({
      title: 'ShopperSprint Email Test',
      heading: '🧪 Email Service Test',
      message: `
        <p>This is a test email from ShopperSprint to verify email functionality.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>To:</strong> ${email}</p>
        <p>If you received this, email service is working correctly! 🎉</p>
      `,
      email,
      isWelcome: false
    });

    const textContent = `
🧪 ShopperSprint Email Test

This is a test email from ShopperSprint to verify email functionality.
Timestamp: ${new Date().toISOString()}
To: ${email}

If you received this, email service is working correctly! 🎉

The ShopperSprint Team
    `;

    const mailOptions = {
      from: getFromEmail(),
      to: email,
      subject: '🧪 ShopperSprint Email Test',
      html: htmlContent,
      text: textContent,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('📧 Test email sent successfully to:', email, 'MessageID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send test email to:', email, error);
    return false;
  }
};

export const sendUnsubscribeConfirmationEmail = async (email: string): Promise<boolean> => {
  const emailTransporter = initializeTransporter();
  
  if (!emailTransporter) {
    console.log('📧 Waitlist email service not available for unsubscribe confirmation to:', email);
    return false;
  }

  try {
    const htmlContent = generateEmailTemplate({
      title: 'Unsubscribed from ShopperSprint',
      heading: '👋 You\'ve Been Unsubscribed',
      message: `
        <p>You have been successfully unsubscribed from the ShopperSprint waitlist.</p>
        <p>We're sorry to see you go! If you change your mind, you can always sign up again at our website.</p>
        <p>Thank you for your interest in ShopperSprint.</p>
      `,
      email,
      isWelcome: false
    });

    const textContent = `
👋 You've Been Unsubscribed from ShopperSprint

You have been successfully unsubscribed from the ShopperSprint waitlist.

We're sorry to see you go! If you change your mind, you can always sign up again at our website.

Thank you for your interest in ShopperSprint.

The ShopperSprint Team
    `;

    const mailOptions = {
      from: getFromEmail(),
      to: email,
      subject: '👋 Unsubscribed from ShopperSprint Waitlist',
      html: htmlContent,
      text: textContent,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('📧 Unsubscribe confirmation email sent successfully to:', email, 'MessageID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send unsubscribe confirmation email to:', email, error);
    return false;
  }
};
