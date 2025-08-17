import * as nodemailer from "nodemailer";
import { config } from "dotenv";

config();

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface VerificationEmailData {
  email: string;
  token: string;
  firstName?: string;
}

export interface PriceAlertEmailData {
  email: string;
  productName: string;
  currentPrice: number;
  targetPrice: number;
  productUrl: string;
  alertType: string;
}

export interface PasswordResetEmailData {
  email: string;
  token: string;
  firstName?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private frontendBaseUrl: string;

  constructor() {
    // Create transporter using environment variables
    this.transporter = nodemailer.createTransport({
      host: process.env["SMTP_HOST"] || "smtp.gmail.com",
      port: parseInt(process.env["SMTP_PORT"] || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env["SMTP_USER"],
        pass: process.env["SMTP_PASS"],
      },
    });

    // Determine frontend base URL with sensible default for dev
    const fallbackFrontend = "http://localhost:5173";
    const envFrontend = process.env["FRONTEND_URL"];
    this.frontendBaseUrl =
      envFrontend && envFrontend.trim().length > 0
        ? envFrontend
        : fallbackFrontend;
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env["SMTP_FROM"] || process.env["SMTP_USER"],
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(
        `Email sent successfully to ${options.to}:`,
        result.messageId
      );
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }

  async sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
    const verificationUrl = `${this.frontendBaseUrl}/email-verification?token=${data.token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email - PricePulse</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to PricePulse!</h1>
              <p>Verify your email to get started</p>
            </div>
            <div class="content">
              <h2>Hi ${data.firstName || "there"}!</h2>
              <p>Welcome to PricePulse! We're excited to have you on board.</p>
              <p>To complete your registration and start tracking prices, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              
              <p>This link will expire in 24 hours for security reasons.</p>
              
              <p>If you didn't create an account with PricePulse, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PricePulse. All rights reserved.</p>
              <p>This email was sent to ${data.email}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: data.email,
      subject: "Verify Your Email - PricePulse",
      html,
    });
  }

  async sendPriceAlertEmail(data: PriceAlertEmailData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Price Alert - PricePulse</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 20px; margin: 20px 0; }
            .price-info { background: white; border-radius: 5px; padding: 20px; margin: 20px 0; text-align: center; }
            .current-price { font-size: 24px; color: #e74c3c; font-weight: bold; }
            .target-price { font-size: 18px; color: #27ae60; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Price Alert!</h1>
              <p>Your price target has been reached!</p>
            </div>
            <div class="content">
              <div class="alert-box">
                <h2>Great news! The price of <strong>${
                  data.productName
                }</strong> has dropped to your target price!</h2>
              </div>
              
              <div class="price-info">
                <p><strong>Current Price:</strong></p>
                <div class="current-price">$${(data.currentPrice / 100).toFixed(
                  2
                )}</div>
                <p><strong>Your Target:</strong></p>
                <div class="target-price">$${(data.targetPrice / 100).toFixed(
                  2
                )}</div>
              </div>
              
              <p>This is your chance to grab this item at a great price! Click the button below to view the product:</p>
              
              <div style="text-align: center;">
                <a href="${data.productUrl}" class="button">View Product</a>
              </div>
              
              <p><strong>Alert Type:</strong> ${data.alertType}</p>
              
              <p>You can manage your price alerts by logging into your PricePulse account.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PricePulse. All rights reserved.</p>
              <p>This email was sent to ${data.email}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: data.email,
      subject: `Price Alert: ${data.productName} - Target Price Reached!`,
      html,
    });
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    const resetUrl = `${this.frontendBaseUrl}/reset-password?token=${data.token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password - PricePulse</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 20px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
              <p>PricePulse Account Security</p>
            </div>
            <div class="content">
              <h2>Hi ${data.firstName || "there"}!</h2>
              <p>We received a request to reset your PricePulse account password.</p>
              
              <p>Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              
              <div class="warning">
                <p><strong>Security Notice:</strong></p>
                <ul>
                  <li>This link will expire in 1 hour for security reasons</li>
                  <li>If you didn't request a password reset, please ignore this email</li>
                  <li>Your current password will remain unchanged</li>
                </ul>
              </div>
              
              <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 PricePulse. All rights reserved.</p>
              <p>This email was sent to ${data.email}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: data.email,
      subject: "Reset Your Password - PricePulse",
      html,
    });
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/&amp;/g, "&") // Replace &amp; with &
      .replace(/&lt;/g, "<") // Replace &lt; with <
      .replace(/&gt;/g, ">") // Replace &gt; with >
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("Email service connection verified successfully");
      return true;
    } catch (error) {
      console.error("Email service connection failed:", error);
      return false;
    }
  }
}
