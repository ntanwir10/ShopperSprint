import Queue from 'bull';
import { ScrapingJob } from './ScrapingService.js';

export interface ScrapingJobData {
  query: string;
  sourceId: string;
  searchId?: string;
  priority: 'high' | 'normal' | 'low';
}

export interface PriceRefreshJobData {
  searchId: string;
  productIds: string[];
  sourceIds: string[];
}

export class QueueService {
  private scrapingQueue: Queue.Queue;
  private priceRefreshQueue: Queue.Queue;

  constructor() {
    // Initialize scraping queue
    this.scrapingQueue = new Queue('scraping', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });

    // Initialize price refresh queue
    this.priceRefreshQueue = new Queue('price-refresh', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 25,
      },
    });

    this.setupQueueHandlers();
  }

  async queueScrapingJob(jobData: ScrapingJobData): Promise<Queue.Job> {
    const priority = this.getPriorityValue(jobData.priority);
    
    const job = await this.scrapingQueue.add(
      'scrape-source',
      jobData,
      {
        priority,
        delay: this.calculateDelay(jobData.priority),
      }
    );

    console.log(`Queued scraping job ${job.id} for source ${jobData.sourceId}`);
    return job;
  }

  async queuePriceRefresh(
    searchId: string,
    productIds: string[],
    sources: any[]
  ): Promise<Queue.Job> {
    const jobData: PriceRefreshJobData = {
      searchId,
      productIds,
      sourceIds: sources.map(s => s.id),
    };

    const job = await this.priceRefreshQueue.add(
      'refresh-prices',
      jobData,
      {
        priority: 1, // High priority for price refreshes
        delay: 1000, // 1 second delay
      }
    );

    console.log(`Queued price refresh job ${job.id} for search ${searchId}`);
    return job;
  }

  async getJobStatus(jobId: string, queueType: 'scraping' | 'price-refresh'): Promise<any> {
    const queue = queueType === 'scraping' ? this.scrapingQueue : this.priceRefreshQueue;
    const job = await queue.getJob(jobId);
    
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = await job.progress();
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      id: job.id,
      data: job.data,
      state,
      progress,
      result,
      failedReason,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  async getQueueStats(): Promise<any> {
    const [scrapingStats, priceRefreshStats] = await Promise.all([
      this.scrapingQueue.getJobCounts(),
      this.priceRefreshQueue.getJobCounts(),
    ]);

    return {
      scraping: scrapingStats,
      priceRefresh: priceRefreshStats,
    };
  }

  async pauseQueue(queueType: 'scraping' | 'price-refresh'): Promise<void> {
    const queue = queueType === 'scraping' ? this.scrapingQueue : this.priceRefreshQueue;
    await queue.pause();
    console.log(`${queueType} queue paused`);
  }

  async resumeQueue(queueType: 'scraping' | 'price-refresh'): Promise<void> {
    const queue = queueType === 'scraping' ? this.scrapingQueue : this.priceRefreshQueue;
    await queue.resume();
    console.log(`${queueType} queue resumed`);
  }

  async clearQueue(queueType: 'scraping' | 'price-refresh'): Promise<void> {
    const queue = queueType === 'scraping' ? this.scrapingQueue : this.priceRefreshQueue;
    await queue.empty();
    console.log(`${queueType} queue cleared`);
  }

  async close(): Promise<void> {
    await Promise.all([
      this.scrapingQueue.close(),
      this.priceRefreshQueue.close(),
    ]);
    console.log('All queues closed');
  }

  private setupQueueHandlers(): void {
    // Scraping queue event handlers
    this.scrapingQueue.on('completed', (job, result) => {
      console.log(`Scraping job ${job.id} completed successfully`);
    });

    this.scrapingQueue.on('failed', (job, err) => {
      console.error(`Scraping job ${job.id} failed:`, err.message);
    });

    this.scrapingQueue.on('stalled', (job) => {
      console.warn(`Scraping job ${job.id} stalled`);
    });

    // Price refresh queue event handlers
    this.priceRefreshQueue.on('completed', (job, result) => {
      console.log(`Price refresh job ${job.id} completed successfully`);
    });

    this.priceRefreshQueue.on('failed', (job, err) => {
      console.error(`Price refresh job ${job.id} failed:`, err.message);
    });

    this.priceRefreshQueue.on('stalled', (job) => {
      console.warn(`Price refresh job ${job.id} stalled`);
    });

    // Global error handler
    this.scrapingQueue.on('error', (error) => {
      console.error('Scraping queue error:', error);
    });

    this.priceRefreshQueue.on('error', (error) => {
      console.error('Price refresh queue error:', error);
    });
  }

  private getPriorityValue(priority: 'high' | 'normal' | 'low'): number {
    switch (priority) {
      case 'high':
        return 1;
      case 'normal':
        return 5;
      case 'low':
        return 10;
      default:
        return 5;
    }
  }

  private calculateDelay(priority: 'high' | 'normal' | 'low'): number {
    switch (priority) {
      case 'high':
        return 0; // No delay for high priority
      case 'normal':
        return 5000; // 5 seconds delay
      case 'low':
        return 30000; // 30 seconds delay
      default:
        return 5000;
    }
  }

  // Get queue instances for external processors
  getScrapingQueue(): Queue.Queue {
    return this.scrapingQueue;
  }

  getPriceRefreshQueue(): Queue.Queue {
    return this.priceRefreshQueue;
  }
}
