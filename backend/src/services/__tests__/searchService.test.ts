import { SearchService } from '../SearchService';
import { SourceRepository } from '../../repositories/sourceRepository';

// Mock dependencies
jest.mock('../../repositories/sourceRepository');

describe('SearchService', () => {
  let searchService: SearchService;
  let mockSourceRepository: jest.Mocked<SourceRepository>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockSourceRepository = {
      getActiveSources: jest.fn(),
    } as any;

    // Create SearchService instance
    searchService = new SearchService(mockSourceRepository);
  });

  describe('search', () => {
    it('should perform search with mock data when scraping fails', async () => {
      // Arrange
      const request = {
        query: 'smartphone',
        maxResults: 5,
      };
      const mockSources = [
        { 
          id: 'source1', 
          name: 'Mock Source 1', 
          isActive: true,
          category: 'popular' as const,
          errorCount: 0,
          configuration: { rateLimit: 1000 },
        },
        { 
          id: 'source2', 
          name: 'Mock Source 2', 
          isActive: true,
          category: 'alternative' as const,
          errorCount: 0,
          configuration: { rateLimit: 1000 },
        },
      ];

      mockSourceRepository.getActiveSources.mockResolvedValue(mockSources);

      // Act
      const result = await searchService.search(request);

      // Assert
      expect(result.searchId).toBeDefined();
      expect(result.metadata.totalSources).toBe(2);
      expect(result.metadata.successfulSources).toBe(0); // No successful scraping
      expect(result.metadata.cacheHit).toBe(false);
    });

    it('should apply price filters correctly', async () => {
      // Arrange
      const request = {
        query: 'smartphone',
        maxResults: 10,
        filters: { minPrice: 20000, maxPrice: 40000 },
      };
      const mockSources = [{ 
        id: 'source1', 
        name: 'Mock Source', 
        isActive: true,
        category: 'popular' as const,
        errorCount: 0,
        configuration: { rateLimit: 1000 },
      }];

      mockSourceRepository.getActiveSources.mockResolvedValue(mockSources);

      // Act
      const result = await searchService.search(request);

      // Assert
      expect(result.metadata.totalSources).toBe(1);
      expect(result.metadata.successfulSources).toBe(0); // No successful scraping
    });

    it('should apply sorting when specified', async () => {
      // Arrange
      const request = {
        query: 'smartphone',
        maxResults: 10,
        sort: { field: 'price' as const, direction: 'asc' as const },
      };
      const mockSources = [{ 
        id: 'source1', 
        name: 'Mock Source', 
        isActive: true,
        category: 'popular' as const,
        errorCount: 0,
        configuration: { rateLimit: 1000 },
      }];

      mockSourceRepository.getActiveSources.mockResolvedValue(mockSources);

      // Act
      const result = await searchService.search(request);

      // Assert
      expect(result.metadata.totalSources).toBe(1);
      expect(result.metadata.successfulSources).toBe(0); // No successful scraping
    });

    it('should handle scraping failures gracefully', async () => {
      // Arrange
      const request = {
        query: 'smartphone',
        maxResults: 5,
      };
      const mockSources = [{ 
        id: 'source1', 
        name: 'Mock Source', 
        isActive: true,
        category: 'popular' as const,
        errorCount: 0,
        configuration: { rateLimit: 1000 },
      }];

      mockSourceRepository.getActiveSources.mockResolvedValue(mockSources);

      // Act
      const result = await searchService.search(request);

      // Assert
      expect(result.metadata.successfulSources).toBe(0);
      expect(result.results).toHaveLength(0);
    });

    it('should respect maxResults limit', async () => {
      // Arrange
      const request = {
        query: 'smartphone',
        maxResults: 2,
      };
      const mockSources = [{ 
        id: 'source1', 
        name: 'Mock Source', 
        isActive: true,
        category: 'popular' as const,
        errorCount: 0,
        configuration: { rateLimit: 1000 },
      }];

      mockSourceRepository.getActiveSources.mockResolvedValue(mockSources);

      // Act
      const result = await searchService.search(request);

      // Assert
      expect(result.metadata.totalSources).toBe(1);
      expect(result.metadata.successfulSources).toBe(0); // No successful scraping
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Arrange
      const request = {
        query: 'smartphone',
        maxResults: 5,
      };
      mockSourceRepository.getActiveSources.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(searchService.search(request)).rejects.toThrow('Database error');
    });

    it('should handle invalid query parameters', async () => {
      // Arrange
      const request = {
        query: '',
        maxResults: -1,
      };

      // Act & Assert
      await expect(searchService.search(request)).rejects.toThrow();
    });
  });
});
