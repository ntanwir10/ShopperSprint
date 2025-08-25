import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory storage for demo purposes
// In production, this would connect to a database
let waitlistData: { email: string; timestamp: string; source?: string }[] = [];

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetWaitlistStats(req, res);
    case 'POST':
      return handleWaitlistSignup(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetWaitlistStats(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const stats = {
      totalSignups: waitlistData.length,
      recentSignups: waitlistData.slice(-10).map(item => ({
        email: item.email,
        timestamp: item.timestamp,
        source: item.source
      })),
      timestamp: new Date().toISOString()
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting waitlist stats:', error);
    res.status(500).json({
      error: 'Failed to get waitlist stats',
      timestamp: new Date().toISOString()
    });
  }
}

async function handleWaitlistSignup(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const { email, source } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: 'Email is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        timestamp: new Date().toISOString()
      });
    }

    // Check if email already exists
    const existingSignup = waitlistData.find(item => item.email === email);
    if (existingSignup) {
      return res.status(409).json({
        error: 'Email already registered',
        timestamp: new Date().toISOString()
      });
    }

    // Add to waitlist
    const signup = {
      email,
      timestamp: new Date().toISOString(),
      source: source || 'direct'
    };

    waitlistData.push(signup);

    // In production, you would save to database here
    console.log('New waitlist signup:', signup);

    res.status(201).json({
      message: 'Successfully added to waitlist',
      email,
      timestamp: signup.timestamp,
      source: signup.source
    });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    res.status(500).json({
      error: 'Failed to add to waitlist',
      timestamp: new Date().toISOString()
    });
  }
}
