// Stub EmailService to maintain compatibility with existing code
// This is a temporary fix - the real email functionality is in waitlistEmailService.ts

export class EmailService {
  constructor() {
    console.log(
      "📧 EmailService (stub) initialized - using waitlistEmailService for actual emails"
    );
  }

  async sendVerificationEmail(data: any): Promise<boolean> {
    console.log(
      "📧 EmailService stub: sendVerificationEmail called for:",
      data.email
    );
    return true; // Stub implementation
  }

  async sendPriceAlertTriggeredEmail(data: any): Promise<boolean> {
    console.log(
      "📧 EmailService stub: sendPriceAlertTriggeredEmail called for:",
      data.email
    );
    return true; // Stub implementation
  }

  async sendEmail(_data: any): Promise<boolean> {
    console.log("📧 EmailService stub: sendEmail called");
    return true; // Stub implementation
  }

  async sendManagementLinkEmail(data: any): Promise<boolean> {
    console.log(
      "📧 EmailService stub: sendManagementLinkEmail called for:",
      data.email
    );
    return true; // Stub implementation
  }

  async verifyConnection(): Promise<boolean> {
    console.log("📧 EmailService stub: verifyConnection called");
    return true; // Stub implementation
  }

  async sendTestEmail(_data: any): Promise<boolean> {
    console.log("📧 EmailService stub: sendTestEmail called");
    return true; // Stub implementation
  }

  async sendPasswordResetEmail(_data: any): Promise<boolean> {
    console.log("📧 EmailService stub: sendPasswordResetEmail called");
    return true; // Stub implementation
  }

  async sendUserVerificationEmail(_data: any): Promise<boolean> {
    console.log("📧 EmailService stub: sendUserVerificationEmail called");
    return true; // Stub implementation
  }
}
