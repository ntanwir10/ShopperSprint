import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Database interface (will be replaced with actual DB later)
interface WaitlistSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  unsubscribeToken: string;
  isActive: boolean;
  source: string;
}

// File-based storage for development (replace with database later)
const WAITLIST_FILE = path.join(__dirname, '../../waitlist-db.json');

// Initialize waitlist file if it doesn't exist
const initWaitlistFile = () => {
  if (!fs.existsSync(WAITLIST_FILE)) {
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify([], null, 2));
  }
};

// Read waitlist from file
const readWaitlist = (): WaitlistSubscriber[] => {
  try {
    initWaitlistFile();
    const data = fs.readFileSync(WAITLIST_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading waitlist file:', error);
    return [];
  }
};

// Write waitlist to file
const writeWaitlist = (subscribers: WaitlistSubscriber[]): void => {
  try {
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(subscribers, null, 2));
  } catch (error) {
    console.error('Error writing waitlist file:', error);
  }
};

// Generate secure unsubscribe token
const generateUnsubscribeToken = (email: string): string => {
  return crypto.createHash('sha256').update(`${email}-${Date.now()}-${Math.random()}`).digest('hex');
};

export class WaitlistService {
  
  // Subscribe to waitlist
  async subscribe(email: string, source: string = 'coming_soon_page'): Promise<{
    success: boolean;
    alreadySubscribed: boolean;
    subscriber?: WaitlistSubscriber;
    message: string;
  }> {
    try {
      const waitlist = readWaitlist();
      
      // Check if email already exists and is active
      const existingSubscriber = waitlist.find(sub => sub.email === email && sub.isActive);
      
      if (existingSubscriber) {
        return {
          success: true,
          alreadySubscribed: true,
          subscriber: existingSubscriber,
          message: 'You are already on our waitlist!'
        };
      }

      // Check if email exists but is inactive (previously unsubscribed)
      const inactiveSubscriber = waitlist.find(sub => sub.email === email && !sub.isActive);
      
      if (inactiveSubscriber) {
        // Reactivate the subscription
        inactiveSubscriber.isActive = true;
        inactiveSubscriber.subscribedAt = new Date().toISOString();
        inactiveSubscriber.unsubscribeToken = generateUnsubscribeToken(email);
        writeWaitlist(waitlist);
        
        return {
          success: true,
          alreadySubscribed: false,
          subscriber: inactiveSubscriber,
          message: 'Welcome back! You have been re-subscribed to our waitlist.'
        };
      }

      // Create new subscription
      const newSubscriber: WaitlistSubscriber = {
        id: uuidv4(),
        email,
        subscribedAt: new Date().toISOString(),
        unsubscribeToken: generateUnsubscribeToken(email),
        isActive: true,
        source
      };

      waitlist.push(newSubscriber);
      writeWaitlist(waitlist);

      return {
        success: true,
        alreadySubscribed: false,
        subscriber: newSubscriber,
        message: 'Successfully joined the waitlist! Check your email for a welcome message.'
      };

    } catch (error) {
      console.error('Error subscribing to waitlist:', error);
      return {
        success: false,
        alreadySubscribed: false,
        message: 'Failed to join waitlist. Please try again.'
      };
    }
  }

  // Unsubscribe from waitlist
  async unsubscribe(token: string): Promise<{
    success: boolean;
    email?: string;
    message: string;
  }> {
    try {
      const waitlist = readWaitlist();
      const subscriber = waitlist.find(sub => sub.unsubscribeToken === token && sub.isActive);

      if (!subscriber) {
        return {
          success: false,
          message: 'Invalid unsubscribe link or already unsubscribed.'
        };
      }

      // Mark as inactive instead of deleting
      subscriber.isActive = false;
      writeWaitlist(waitlist);

      return {
        success: true,
        email: subscriber.email,
        message: 'You have been successfully unsubscribed from our waitlist.'
      };

    } catch (error) {
      console.error('Error unsubscribing from waitlist:', error);
      return {
        success: false,
        message: 'Failed to unsubscribe. Please try again.'
      };
    }
  }

  // Get waitlist statistics
  async getStats(): Promise<{
    totalEverSubscribed: number;      // Total people who ever subscribed
    currentlySubscribed: number;      // People currently subscribed (active)
    totalUnsubscribed: number;        // People who unsubscribed
    subscribers?: WaitlistSubscriber[]; // Only for development
  }> {
    try {
      const waitlist = readWaitlist();
      const activeSubscribers = waitlist.filter(sub => sub.isActive);
      const inactiveSubscribers = waitlist.filter(sub => !sub.isActive);

      return {
        totalEverSubscribed: waitlist.length,           // Total people who ever signed up
        currentlySubscribed: activeSubscribers.length,  // Currently active subscribers
        totalUnsubscribed: inactiveSubscribers.length,  // People who unsubscribed
        subscribers: process.env.NODE_ENV === 'development' ? waitlist : undefined
      };

    } catch (error) {
      console.error('Error getting waitlist stats:', error);
      return {
        totalEverSubscribed: 0,
        currentlySubscribed: 0,
        totalUnsubscribed: 0
      };
    }
  }

  // Get subscriber by email (for admin use)
  async getSubscriberByEmail(email: string): Promise<WaitlistSubscriber | null> {
    try {
      const waitlist = readWaitlist();
      return waitlist.find(sub => sub.email === email) || null;
    } catch (error) {
      console.error('Error getting subscriber by email:', error);
      return null;
    }
  }

  // Get subscriber by token (for unsubscribe)
  async getSubscriberByToken(token: string): Promise<WaitlistSubscriber | null> {
    try {
      const waitlist = readWaitlist();
      return waitlist.find(sub => sub.unsubscribeToken === token) || null;
    } catch (error) {
      console.error('Error getting subscriber by token:', error);
      return null;
    }
  }
}
