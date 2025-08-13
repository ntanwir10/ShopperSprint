import { SearchService } from './SearchService.js';
import { ScrapingService } from './ScrapingService.js';
import { QueueService } from './QueueService.js';
import { AdvertisementService } from './AdvertisementService.js';
import { RepositoryFactory } from '../repositories/index.js';

export class ServiceFactory {
  private searchService: SearchService;
  private scrapingService: ScrapingService;
  private queueService: QueueService;
  private advertisementService: AdvertisementService;

  constructor(repositoryFactory: RepositoryFactory) {
    // Initialize services with dependencies
    this.queueService = new QueueService();
    this.scrapingService = new ScrapingService(
      repositoryFactory.createSourceRepository(),
      repositoryFactory.createProductRepository(),
      repositoryFactory.createProductListingRepository()
    );
    this.searchService = new SearchService(
      repositoryFactory.createProductRepository(),
      repositoryFactory.createProductListingRepository(),
      repositoryFactory.createSearchRepository(),
      repositoryFactory.createSourceRepository()
    );
    this.advertisementService = new AdvertisementService(
      repositoryFactory.createAdvertisementRepository()
    );
  }

  async initialize(): Promise<void> {
    try {
      await this.scrapingService.initialize();
      console.log('✅ All services initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      throw error;
    }
  }

  getSearchService(): SearchService {
    return this.searchService;
  }

  getScrapingService(): ScrapingService {
    return this.scrapingService;
  }

  getQueueService(): QueueService {
    return this.queueService;
  }

  getAdvertisementService(): AdvertisementService {
    return this.advertisementService;
  }

  async cleanup(): Promise<void> {
    try {
      await this.scrapingService.cleanup();
      await this.queueService.close();
      console.log('✅ All services cleaned up successfully');
    } catch (error) {
      console.error('❌ Error during service cleanup:', error);
    }
  }
}

export { SearchService, ScrapingService, QueueService, AdvertisementService };
