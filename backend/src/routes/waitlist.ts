import { Router } from 'express';
import { z } from 'zod';
import { WaitlistService } from '../services/waitlistService.js';
import { sendWaitlistWelcomeEmail, sendTestEmail, sendUnsubscribeConfirmationEmail } from '../services/waitlistEmailService.js';

const router = Router();
const waitlistService = new WaitlistService();

// Validation schemas
const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  source: z.string().optional().default('coming_soon_page'),
});

const unsubscribeSchema = z.object({
  token: z.string().min(1, 'Unsubscribe token is required'),
});

/**
 * POST /api/waitlist/subscribe
 * Subscribe to the waitlist
 */
router.post('/subscribe', async (req, res) => {
  try {
    console.log('Waitlist subscribe request:', req.body);
    
    const { email, source } = subscribeSchema.parse(req.body);

    // Subscribe using the service
    const result = await waitlistService.subscribe(email, source);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message,
      });
    }

    // Send welcome email if it's a new subscription
    if (!result.alreadySubscribed && result.subscriber) {
      sendWaitlistWelcomeEmail(email, result.subscriber.unsubscribeToken).catch(err => {
        console.error('Failed to send welcome email:', err);
      });
    }

    console.log(`Waitlist subscription: ${email} (already subscribed: ${result.alreadySubscribed})`);

    res.status(result.alreadySubscribed ? 200 : 201).json({
      success: true,
      message: result.message,
      alreadySubscribed: result.alreadySubscribed,
    });

  } catch (error) {
    console.error('Waitlist subscription error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to join waitlist. Please try again.',
    });
  }
});

/**
 * POST /api/waitlist/unsubscribe
 * Unsubscribe from the waitlist using token
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    console.log('Waitlist unsubscribe request:', req.body);
    
    const { token } = unsubscribeSchema.parse(req.body);

    // Unsubscribe using the service
    const result = await waitlistService.unsubscribe(token);

    if (result.success && result.email) {
      // Send confirmation email
      sendUnsubscribeConfirmationEmail(result.email).catch(err => {
        console.error('Failed to send unsubscribe confirmation email:', err);
      });
      
      console.log(`Waitlist unsubscribe: ${result.email}`);
    }

    res.status(result.success ? 200 : 400).json({
      success: result.success,
      message: result.message,
    });

  } catch (error) {
    console.error('Waitlist unsubscribe error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe. Please try again.',
    });
  }
});

/**
 * GET /api/waitlist/unsubscribe/:token
 * Unsubscribe via GET request (for email links)
 */
router.get('/unsubscribe/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid unsubscribe link.',
      });
    }

    // Get subscriber info first
    const subscriber = await waitlistService.getSubscriberByToken(token);
    
    if (!subscriber) {
      return res.status(400).json({
        success: false,
        message: 'Invalid unsubscribe link or already unsubscribed.',
      });
    }

    // Unsubscribe using the service
    const result = await waitlistService.unsubscribe(token);

    if (result.success && result.email) {
      // Send confirmation email
      sendUnsubscribeConfirmationEmail(result.email).catch(err => {
        console.error('Failed to send unsubscribe confirmation email:', err);
      });
      
      console.log(`Waitlist unsubscribe via link: ${result.email}`);
    }

    // Return HTML response for browser
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed - ShopperSprint</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .container { background: #f8fafc; padding: 40px; border-radius: 15px; }
          .success { color: #059669; }
          .error { color: #dc2626; }
          .logo { font-size: 2em; margin-bottom: 20px; }
          .message { font-size: 1.2em; margin-bottom: 20px; }
          .back-link { color: #2563eb; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🛒 ShopperSprint</div>
          ${result.success ? `
            <h2 class="success">✅ Successfully Unsubscribed</h2>
            <p class="message">You have been unsubscribed from our waitlist. We're sorry to see you go!</p>
            <p>If you change your mind, you can always sign up again on our website.</p>
          ` : `
            <h2 class="error">❌ Unsubscribe Failed</h2>
            <p class="message">${result.message}</p>
          `}
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="back-link">← Back to ShopperSprint</a></p>
        </div>
      </body>
      </html>
    `;

    res.status(result.success ? 200 : 400).send(html);

  } catch (error) {
    console.error('Waitlist unsubscribe via link error:', error);
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - ShopperSprint</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .container { background: #f8fafc; padding: 40px; border-radius: 15px; }
          .error { color: #dc2626; }
          .logo { font-size: 2em; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🛒 ShopperSprint</div>
          <h2 class="error">❌ Something went wrong</h2>
          <p>We couldn't process your unsubscribe request. Please try again later.</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">← Back to ShopperSprint</a></p>
        </div>
      </body>
      </html>
    `;

    res.status(500).send(html);
  }
});

/**
 * GET /api/waitlist/stats
 * Get waitlist statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await waitlistService.getStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Waitlist stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch waitlist statistics',
    });
  }
});

/**
 * POST /api/waitlist/test-email
 * Send test email (for development/testing)
 */
router.post('/test-email', async (req, res) => {
  try {
    const { email } = subscribeSchema.parse(req.body);
    
    const success = await sendTestEmail(email);
    
    if (success) {
      res.json({
        success: true,
        message: 'Test email sent successfully!',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email. Check server logs.',
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send test email.',
    });
  }
});

/**
 * GET /api/waitlist/debug
 * Debug endpoint to check environment variables (for development only)
 */
router.get('/debug', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }

  res.json({
    smtp_configured: {
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      SMTP_FROM: !!process.env.SMTP_FROM,
    },
    values: {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT SET',
      SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
      SMTP_FROM: process.env.SMTP_FROM,
      FRONTEND_URL: process.env.FRONTEND_URL,
    }
  });
});

export default router;
