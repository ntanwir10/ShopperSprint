const { EmailService } = require("./src/services/emailService");

async function testEmailService() {
  console.log("🧪 Testing Email Service Configuration...\n");

  const emailService = new EmailService();

  try {
    // Test connection
    console.log("1. Testing SMTP connection...");
    const isConnected = await emailService.testEmailService();

    if (isConnected) {
      console.log("✅ SMTP connection successful!\n");
    } else {
      console.log("❌ SMTP connection failed!\n");
      return;
    }

    // Test email sending
    console.log("2. Testing email sending...");
    const testEmail = process.argv[2] || "test@example.com";

    await emailService.sendTestEmail(
      testEmail,
      "ShopperSprint Email Test",
      "This is a test email from ShopperSprint to verify your email configuration is working correctly."
    );

    console.log(`✅ Test email sent successfully to ${testEmail}!\n`);
    console.log("🎉 Email service is working correctly!");
  } catch (error) {
    console.error("❌ Email service test failed:", error.message);
    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Check your SMTP configuration in .env file");
    console.log(
      "2. Verify SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are set correctly"
    );
    console.log(
      "3. For Gmail, make sure you're using an App Password, not your regular password"
    );
    console.log("4. Check if your email provider allows SMTP access");
  }
}

// Run the test
testEmailService();
