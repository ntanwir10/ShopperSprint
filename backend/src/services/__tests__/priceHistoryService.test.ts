import { PriceHistoryService } from '../priceHistoryService';
import { ProductRepository } from '../../repositories/productRepository';

// Mock dependencies
jest.mock('../../repositories/productRepository');

describe('PriceHistoryService', () => {
  let priceHistoryService: PriceHistoryService;
  let mockProductRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockProductRepository = {
      findById: jest.fn(),
      getProductListingsByProductId: jest.fn(),
      getSourceById: jest.fn(),
    } as any;

    // Create PriceHistoryService instance
    priceHistoryService = new PriceHistoryService(mockProductRepository);
  });

  describe('getPriceHistory', () => {
    it('should return price history for a product', async () => {
      // Arrange
      const productId = 'test_product';
      const mockListings = [
        {
          id: 'listing1',
          price: 25000,
          currency: 'USD',
          sourceId: 'source1',
          createdAt: new Date('2025-01-01'),
          isValid: true,
        },
        {
          id: 'listing2',
          price: 24000,
          currency: 'USD',
          sourceId: 'source2',
          createdAt: new Date('2025-01-02'),
          isValid: true,
        },
      ];

      mockProductRepository.getProductListingsByProductId.mockResolvedValue(mockListings);

      // Act
      const result = await priceHistoryService.getPriceHistory(productId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].price).toBe(25000);
      expect(result[1].price).toBe(24000);
      expect(mockProductRepository.getProductListingsByProductId).toHaveBeenCalledWith(productId);
    });

    it('should return empty history for product with no listings', async () => {
      // Arrange
      const productId = 'empty_product';
      mockProductRepository.getProductListingsByProductId.mockResolvedValue([]);

      // Act
      const result = await priceHistoryService.getPriceHistory(productId);

      // Assert
      expect(result).toBeDefined();
      expect(result.productId).toBe(productId);
      expect(result.history).toHaveLength(0);
    });

    it('should filter out invalid listings', async () => {
      // Arrange
      const productId = 'test_product';
      const mockListings = [
        {
          id: 'listing1',
          price: 25000,
          currency: 'USD',
          sourceId: 'source1',
          createdAt: new Date('2025-01-01'),
          isValid: true,
        },
        {
          id: 'listing2',
          price: 24000,
          currency: 'USD',
          sourceId: 'source2',
          createdAt: new Date('2025-01-02'),
          isValid: false, // Invalid listing
        },
      ];

      mockProductRepository.getProductListingsByProductId.mockResolvedValue(mockListings);

      // Act
      const result = await priceHistoryService.getPriceHistory(productId);

      // Assert
      expect(result.history).toHaveLength(1);
      expect(result.history[0].price).toBe(25000);
    });
  });

  describe('getPriceComparison', () => {
    it('should return price comparison between sources', async () => {
      // Arrange
      const productId = 'test_product';
      const mockListings = [
        {
          id: 'listing1',
          price: 25000,
          currency: 'USD',
          sourceId: 'source1',
          createdAt: new Date('2025-01-01'),
          isValid: true,
        },
        {
          id: 'listing2',
          price: 24000,
          currency: 'USD',
          sourceId: 'source2',
          createdAt: new Date('2025-01-02'),
          isValid: true,
        },
      ];

      mockProductRepository.getProductListingsByProductId.mockResolvedValue(mockListings);
      mockProductRepository.getSourceById.mockResolvedValue({ name: 'Test Source' } as any);

      // Act
      const result = await priceHistoryService.getPriceComparison(productId);

      // Assert
      expect(result).toBeDefined();
      expect(result.productId).toBe(productId);
      expect(result.comparison).toHaveLength(2);
      expect(result.comparison[0].price).toBe(25000);
      expect(result.comparison[1].price).toBe(24000);
    });

    it('should handle missing source information gracefully', async () => {
      // Arrange
      const productId = 'test_product';
      const mockListings = [
        {
          id: 'listing1',
          price: 25000,
          currency: 'USD',
          sourceId: 'source1',
          createdAt: new Date('2025-01-01'),
          isValid: true,
        },
      ];

      mockProductRepository.getProductListingsByProductId.mockResolvedValue(mockListings);
      mockProductRepository.getSourceById.mockResolvedValue(null);

      // Act
      const result = await priceHistoryService.getPriceComparison(productId);

      // Assert
      expect(result.comparison[0].sourceName).toBe('Unknown Source');
    });
  });

  describe('getPriceTrends', () => {
    it('should calculate price trends correctly', async () => {
      // Arrange
      const productId = 'test_product';
      const mockListings = [
        {
          id: 'listing1',
          price: 25000,
          currency: 'USD',
          sourceId: 'source1',
          createdAt: new Date('2025-01-01'),
          isValid: true,
        },
        {
          id: 'listing2',
          price: 24000,
          currency: 'USD',
          sourceId: 'source1',
          createdAt: new Date('2025-01-02'),
          isValid: true,
        },
        {
          id: 'listing3',
          price: 23000,
          currency: 'USD',
          sourceId: 'source1',
          createdAt: new Date('2025-01-03'),
          isValid: true,
        },
      ];

      mockProductRepository.getProductListingsByProductId.mockResolvedValue(mockListings);

      // Act
      const result = await priceHistoryService.getPriceTrends(productId);

      // Assert
      expect(result).toBeDefined();
      expect(result.productId).toBe(productId);
      expect(result.trend).toBe('decreasing');
      expect(result.priceChange).toBe(-2000); // 23000 - 25000
      expect(result.percentageChange).toBe(-8); // (-2000 / 25000) * 100
    });

    it('should handle single price point', async () => {
      // Arrange
      const productId = 'test_product';
      const mockListings = [
        {
          id: 'listing1',
          price: 25000,
          currency: 'USD',
          sourceId: 'source1',
          createdAt: new Date('2025-01-01'),
          isValid: true,
        },
      ];

      mockProductRepository.getProductListingsByProductId.mockResolvedValue(mockListings);

      // Act
      const result = await priceHistoryService.getPriceTrends(productId);

      // Assert
      expect(result.trend).toBe('stable');
      expect(result.priceChange).toBe(0);
      expect(result.percentageChange).toBe(0);
    });

    it('should identify increasing trend', async () => {
      // Arrange
      const productId = 'test_product';
      const mockListings = [
        {
          id: 'listing1',
          price: 23000,
          currency: 'USD',
          sourceId: 'source1',
          createdAt: new Date('2025-01-01'),
          isValid: true,
        },
        {
          id: 'listing2',
          price: 24000,
          currency: 'USD',
          sourceId: 'source1',
          createdAt: new Date('2025-01-02'),
          isValid: true,
        },
        {
          id: 'listing3',
          price: 25000,
          currency: 'USD',
          sourceId: 'source1',
          createdAt: new Date('2025-01-03'),
          isValid: true,
        },
      ];

      mockProductRepository.getProductListingsByProductId.mockResolvedValue(mockListings);

      // Act
      const result = await priceHistoryService.getPriceTrends(productId);

      // Assert
      expect(result.trend).toBe('increasing');
      expect(result.priceChange).toBe(2000);
      expect(result.percentageChange).toBe(8.7); // (2000 / 23000) * 100
    });
  });

  describe('getLowestPrice', () => {
    it('should return the lowest price across all sources', async () => {
      // Arrange
      const productId = 'test_product';
      const mockListings = [
        {
          id: 'listing1',
          price: 25000,
          currency: 'USD',
          sourceId: 'source1',
          createdAt: new Date('2025-01-01'),
          isValid: true,
        },
        {
          id: 'listing2',
          price: 24000,
          currency: 'USD',
          sourceId: 'source2',
          createdAt: new Date('2025-01-02'),
          isValid: true,
        },
        {
          id: 'listing3',
          price: 26000,
          currency: 'USD',
          sourceId: 'source3',
          createdAt: new Date('2025-01-03'),
          isValid: true,
        },
      ];

      mockProductRepository.getProductListingsByProductId.mockResolvedValue(mockListings);

      // Act
      const result = await priceHistoryService.getLowestPrice(productId);

      // Assert
      expect(result).toBeDefined();
      expect(result.price).toBe(24000);
      expect(result.sourceId).toBe('source2');
    });

    it('should return null for products with no valid listings', async () => {
      // Arrange
      const productId = 'test_product';
      mockProductRepository.getProductListingsByProductId.mockResolvedValue([]);

      // Act
      const result = await priceHistoryService.getLowestPrice(productId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Arrange
      const productId = 'test_product';
      mockProductRepository.getProductListingsByProductId.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(priceHistoryService.getPriceHistory(productId)).rejects.toThrow('Database error');
    });

    it('should handle missing product gracefully', async () => {
      // Arrange
      const productId = 'non_existent_product';
      mockProductRepository.getProductListingsByProductId.mockResolvedValue([]);

      // Act
      const result = await priceHistoryService.getPriceHistory(productId);

      // Assert
      expect(result.history).toHaveLength(0);
    });
  });
});
