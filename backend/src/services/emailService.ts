import * as dotenv from "dotenv";
dotenv.config();
import nodemailer, { Transporter } from "nodemailer";
import { AnonymousPriceAlert } from "./anonymousNotificationService";

export class EmailService {
  private transporter: Transporter;

  constructor() {
    const secure = String(process.env["SMTP_SECURE"] || "false") === "true";
    this.transporter = nodemailer.createTransport({
      host: process.env["SMTP_HOST"] || "smtp.gmail.com",
      port: parseInt(process.env["SMTP_PORT"] || (secure ? "465" : "587")),
      secure,
      auth: {
        user: process.env["SMTP_USER"],
        pass: process.env["SMTP_PASS"],
      },
    });
  }

  /**
   * Send verification email for registered user
   */
  async sendUserVerificationEmail(input: {
    email: string;
    token: string;
    firstName?: string;
  }): Promise<void> {
    const verificationUrl = `${process.env["FRONTEND_URL"] || "http://localhost:5173"}/verify-email?token=${input.token}`;

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif">
          <h2>Verify your PricePulse account</h2>
          <p>Hello${input.firstName ? ` ${input.firstName}` : ""},</p>
          <p>Thanks for signing up. Please verify your email to activate your account.</p>
          <p><a href="${verificationUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">Verify Email</a></p>
          <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
        </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env["SMTP_FROM"] || "noreply@pricepulse.com",
      to: input.email,
      subject: "Verify your PricePulse account",
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(input: {
    email: string;
    token: string;
    firstName?: string;
  }): Promise<void> {
    const resetUrl = `${process.env["FRONTEND_URL"] || "http://localhost:5173"}/reset-password?token=${input.token}`;

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif">
          <h2>Reset your Password</h2>
          <p>Hello${input.firstName ? ` ${input.firstName}` : ""},</p>
          <p>We received a request to reset your password. Click the button below to continue.</p>
          <p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">Reset Password</a></p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env["SMTP_FROM"] || "noreply@pricepulse.com",
      to: input.email,
      subject: "Reset your PricePulse password",
      html,
    });
  }

  /**
   * Send verification email for anonymous price alert
   */
  async sendVerificationEmail(alert: AnonymousPriceAlert): Promise<void> {
    const verificationUrl = `${process.env["FRONTEND_URL"]}/verify/${alert.verificationToken}`;
    const managementUrl = `${process.env["FRONTEND_URL"]}/manage/${alert.managementToken}`;

    const html = this.getVerificationEmailTemplate(
      alert,
      verificationUrl,
      managementUrl
    );

    await this.transporter.sendMail({
      from: process.env["SMTP_FROM"] || "noreply@pricepulse.com",
      to: alert.email,
      subject: "Verify Your Price Alert - PricePulse",
      html,
    });
  }

  /**
   * Send price alert triggered notification email
   */
  async sendPriceAlertTriggeredEmail(
    alert: AnonymousPriceAlert,
    currentPrice: number
  ): Promise<void> {
    const managementUrl = `${process.env["FRONTEND_URL"]}/manage/${alert.managementToken}`;

    const html = this.getPriceAlertTriggeredTemplate(
      alert,
      currentPrice,
      managementUrl
    );

    await this.transporter.sendMail({
      from: process.env["SMTP_FROM"] || "noreply@pricepulse.com",
      to: alert.email,
      subject: "Price Alert Triggered! - PricePulse",
      html,
    });
  }

  /**
   * Send management link email (for users who lost their management link)
   */
  async sendManagementLinkEmail(alert: AnonymousPriceAlert): Promise<void> {
    const managementUrl = `${process.env["FRONTEND_URL"]}/manage/${alert.managementToken}`;

    const html = this.getManagementLinkTemplate(alert, managementUrl);

    await this.transporter.sendMail({
      from: process.env["SMTP_FROM"] || "noreply@pricepulse.com",
      to: alert.email,
      subject: "Manage Your Price Alert - PricePulse",
      html,
    });
  }

  /**
   * Test email service configuration
   */
  async testEmailService(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("Email service test failed:", error);
      return false;
    }
  }

  async verifyConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.transporter.verify();
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error?.message || String(error) };
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(
    to: string,
    subject: string,
    body: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from: process.env["SMTP_FROM"] || "noreply@pricepulse.com",
      to,
      subject,
      text: body,
    });
  }

  private getVerificationEmailTemplate(
    alert: AnonymousPriceAlert,
    verificationUrl: string,
    managementUrl: string
  ): string {
    const targetPrice = (alert.targetPrice / 100).toFixed(2);
    const currency = alert.currency;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Price Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .button:hover { background: #1d4ed8; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          .alert-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Verify Your Price Alert</h1>
          </div>
          
          <div class="content">
            <p>Hello!</p>
            
            <p>You've created a price alert for a product. To activate your alert and start receiving notifications, please verify your email address.</p>
            
            <div class="alert-details">
              <h3>Alert Details:</h3>
              <p><strong>Target Price:</strong> ${currency} ${targetPrice}</p>
              <p><strong>Alert Type:</strong> ${alert.alertType}</p>
              ${
                alert.threshold
                  ? `<p><strong>Threshold:</strong> ${alert.threshold}%</p>`
                  : ""
              }
            </div>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">✅ Verify Alert</a>
            </div>
            
            <p><strong>Or copy this link:</strong><br>
            <a href="${verificationUrl}">${verificationUrl}</a></p>
            
            <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <h3>📧 Manage Your Alert</h3>
            <p>Once verified, you can manage your alert using this link:</p>
            <a href="${managementUrl}" class="button">🔧 Manage Alert</a>
            
            <p><strong>Or copy this link:</strong><br>
            <a href="${managementUrl}">${managementUrl}</a></p>
            
            <p><strong>Note:</strong> The management link will never expire and can be used to update or delete your alert.</p>
          </div>
          
          <div class="footer">
            <p>This email was sent by PricePulse - Track prices, save money, and never overpay again.</p>
            <p>If you didn't create this alert, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPriceAlertTriggeredTemplate(
    alert: AnonymousPriceAlert,
    currentPrice: number,
    managementUrl: string
  ): string {
    const targetPrice = (alert.targetPrice / 100).toFixed(2);
    const currentPriceFormatted = (currentPrice / 100).toFixed(2);
    const currency = alert.currency;
    const priceChange = (
      ((currentPrice - alert.targetPrice) / alert.targetPrice) *
      100
    ).toFixed(1);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Price Alert Triggered!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .button:hover { background: #b91c1c; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          .price-alert { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .price-change { font-size: 18px; font-weight: bold; color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Price Alert Triggered!</h1>
          </div>
          
          <div class="content">
            <p>Hello!</p>
            
            <p>Your price alert has been triggered! The product you're tracking has reached your target price.</p>
            
            <div class="price-alert">
              <h3>🎯 Alert Details:</h3>
              <p><strong>Target Price:</strong> ${currency} ${targetPrice}</p>
              <p><strong>Current Price:</strong> ${currency} ${currentPriceFormatted}</p>
              <p><strong>Price Change:</strong> <span class="price-change">${priceChange}%</span></p>
              <p><strong>Alert Type:</strong> ${alert.alertType}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${managementUrl}" class="button">🔧 Manage Your Alerts</a>
            </div>
            
            <p><strong>What you can do:</strong></p>
            <ul>
              <li>View the current product price</li>
              <li>Update your alert settings</li>
              <li>Delete this alert if no longer needed</li>
              <li>Create new alerts for other products</li>
            </ul>
            
            <p><strong>Need help?</strong> Reply to this email or visit our support page.</p>
          </div>
          
          <div class="footer">
            <p>This email was sent by PricePulse - Track prices, save money, and never overpay again.</p>
            <p>To stop receiving these emails, <a href="${managementUrl}">manage your alerts</a>.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getManagementLinkTemplate(
    alert: AnonymousPriceAlert,
    managementUrl: string
  ): string {
    const targetPrice = (alert.targetPrice / 100).toFixed(2);
    const currency = alert.currency;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Manage Your Price Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .button:hover { background: #047857; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          .alert-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #059669; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔧 Manage Your Price Alert</h1>
          </div>
          
          <div class="content">
            <p>Hello!</p>
            
            <p>You requested a link to manage your price alert. Here it is:</p>
            
            <div class="alert-details">
              <h3>Alert Details:</h3>
              <p><strong>Target Price:</strong> ${currency} ${targetPrice}</p>
              <p><strong>Alert Type:</strong> ${alert.alertType}</p>
              ${
                alert.threshold
                  ? `<p><strong>Threshold:</strong> ${alert.threshold}%</p>`
                  : ""
              }
              <p><strong>Status:</strong> ${
                alert.isVerified ? "✅ Verified" : "⏳ Pending Verification"
              }</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${managementUrl}" class="button">🔧 Manage Alert</a>
            </div>
            
            <p><strong>Or copy this link:</strong><br>
            <a href="${managementUrl}">${managementUrl}</a></p>
            
            <p><strong>What you can do:</strong></p>
            <ul>
              <li>Update your target price</li>
              <li>Change alert type or threshold</li>
              <li>Activate or deactivate the alert</li>
              <li>Delete the alert</li>
            </ul>
            
            <p><strong>Note:</strong> This management link will never expire and can be used anytime.</p>
          </div>
          
          <div class="footer">
            <p>This email was sent by PricePulse - Track prices, save money, and never overpay again.</p>
            <p>If you didn't request this link, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
