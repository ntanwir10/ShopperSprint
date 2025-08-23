import { ProductRepository } from '../productRepository';
import { db } from '../../database/connection';

// Mock database connection
jest.mock('../../database/connection', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    from: jest.fn(),
  },
}));

describe('ProductRepository', () => {
  let productRepository: ProductRepository;
  let mockedDb: jest.Mocked<typeof db>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Get mocked database
    mockedDb = db as jest.Mocked<typeof db>;

    // Create ProductRepository instance
    productRepository = new ProductRepository();
  });

  describe('findById', () => {
    it('should find product by ID', async () => {
      // Arrange
      const productId = 'test_product_id';
      const mockProduct = {
        id: productId,
        name: 'Test Product',
        description: 'Test Description',
        category: 'electronics',
        brand: 'Test Brand',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue([mockProduct]),
          }),
        }),
      } as any);

      // Act
      const result = await productRepository.findById(productId);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(mockedDb.select).toHaveBeenCalled();
    });

    it('should return null for non-existent product', async () => {
      // Arrange
      const productId = 'non_existent_id';
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Act
      const result = await productRepository.findById(productId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getProductListingsByProductId', () => {
    it('should return product listings for a product', async () => {
      // Arrange
      const productId = 'test_product_id';
      const mockListings = [
        {
          id: 'listing1',
          productId: productId,
          sourceId: 'source1',
          price: 25000,
          currency: 'USD',
          availability: 'in_stock',
          url: 'https://example.com/product1',
          imageUrl: 'https://example.com/image1.jpg',
          rating: 4.5,
          reviewCount: 100,
          lastScraped: new Date(),
          isValid: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'listing2',
          productId: productId,
          sourceId: 'source2',
          price: 24000,
          currency: 'USD',
          availability: 'in_stock',
          url: 'https://example.com/product2',
          imageUrl: 'https://example.com/image2.jpg',
          rating: 4.2,
          reviewCount: 80,
          lastScraped: new Date(),
          isValid: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue(mockListings),
          }),
        }),
      } as any);

      // Act
      const result = await productRepository.getProductListingsByProductId(productId);

      // Assert
      expect(result).toEqual(mockListings);
      expect(result.length).toBe(2);
      expect(mockedDb.select).toHaveBeenCalled();
    });

    it('should return empty array for product with no listings', async () => {
      // Arrange
      const productId = 'product_with_no_listings';
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Act
      const result = await productRepository.getProductListingsByProductId(productId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getSourceById', () => {
    it('should return source by ID', async () => {
      // Arrange
      const sourceId = 'test_source_id';
      const mockSource = {
        id: sourceId,
        name: 'Test Store',
        category: 'popular',
        isActive: true,
        errorCount: 0,
        configuration: {
          baseUrl: 'https://teststore.com',
          searchUrl: 'https://teststore.com/search',
          rateLimit: 1000,
        },
        lastSuccessfulScrape: new Date(),
        averageResponseTime: 500,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue([mockSource]),
          }),
        }),
      } as any);

      // Act
      const result = await productRepository.getSourceById(sourceId);

      // Assert
      expect(result).toEqual(mockSource);
      expect(mockedDb.select).toHaveBeenCalled();
    });

    it('should return null for non-existent source', async () => {
      // Arrange
      const sourceId = 'non_existent_source';
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Act
      const result = await productRepository.getSourceById(sourceId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      // Arrange
      const productData = {
        name: 'New Product',
        description: 'New Product Description',
        category: 'electronics',
        brand: 'New Brand',
      };

      const mockInsertedProduct = {
        id: 'new_product_id',
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedProduct]),
        }),
      } as any);

      // Act
      const result = await productRepository.createProduct(productData);

      // Assert
      expect(result).toEqual(mockInsertedProduct);
      expect(mockedDb.insert).toHaveBeenCalled();
    });

    it('should handle creation errors gracefully', async () => {
      // Arrange
      const productData = {
        name: 'New Product',
        description: 'New Product Description',
        category: 'electronics',
        brand: 'New Brand',
      };

      mockedDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any);

      // Act & Assert
      await expect(productRepository.createProduct(productData)).rejects.toThrow('Database error');
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      // Arrange
      const productId = 'test_product_id';
      const updates = {
        name: 'Updated Product Name',
        price: 30000,
      };

      const mockUpdatedProduct = {
        id: productId,
        name: 'Updated Product Name',
        description: 'Test Description',
        category: 'electronics',
        brand: 'Test Brand',
        price: 30000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([mockUpdatedProduct]),
            }),
          }),
        }),
      } as any);

      // Act
      const result = await productRepository.updateProduct(productId, updates);

      // Assert
      expect(result).toEqual(mockUpdatedProduct);
      expect(mockedDb.update).toHaveBeenCalled();
    });

    it('should return null for non-existent product update', async () => {
      // Arrange
      const productId = 'non_existent_product';
      const updates = { name: 'Updated Name' };

      mockedDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);

      // Act
      const result = await productRepository.updateProduct(productId, updates);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('deleteProduct', () => {
    it('should delete an existing product', async () => {
      // Arrange
      const productId = 'test_product_id';
      mockedDb.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: productId }]),
          }),
        }),
      } as any);

      // Act
      const result = await productRepository.deleteProduct(productId);

      // Assert
      expect(result).toBe(true);
      expect(mockedDb.delete).toHaveBeenCalled();
    });

    it('should return false for non-existent product deletion', async () => {
      // Arrange
      const productId = 'non_existent_product';
      mockedDb.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Act
      const result = await productRepository.deleteProduct(productId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('searchProducts', () => {
    it('should search products with filters', async () => {
      // Arrange
      const searchQuery = 'smartphone';
      const filters = {
        minPrice: 20000,
        maxPrice: 40000,
        category: 'electronics',
      };

      const mockProducts = [
        {
          id: 'product1',
          name: 'Smartphone 1',
          price: 25000,
          category: 'electronics',
        },
        {
          id: 'product2',
          name: 'Smartphone 2',
          price: 35000,
          category: 'electronics',
        },
      ];

      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            ilike: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue(mockProducts),
                }),
              }),
            }),
          }),
        }),
      } as any);

      // Act
      const result = await productRepository.searchProducts(searchQuery, filters);

      // Assert
      expect(result).toEqual(mockProducts);
      expect(result.length).toBe(2);
      expect(mockedDb.select).toHaveBeenCalled();
    });

    it('should handle search with no filters', async () => {
      // Arrange
      const searchQuery = 'laptop';
      const mockProducts = [
        {
          id: 'product1',
          name: 'Laptop 1',
          price: 50000,
          category: 'electronics',
        },
      ];

      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            ilike: jest.fn().mockResolvedValue(mockProducts),
          }),
        }),
      } as any);

      // Act
      const result = await productRepository.searchProducts(searchQuery);

      // Assert
      expect(result).toEqual(mockProducts);
      expect(mockedDb.select).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const productId = 'test_product';
      mockedDb.select.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      // Act & Assert
      await expect(productRepository.findById(productId)).rejects.toThrow('Connection failed');
    });

    it('should handle invalid query parameters', async () => {
      // Arrange
      const invalidQuery = '';
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            ilike: jest.fn().mockRejectedValue(new Error('Invalid query')),
          }),
        }),
      } as any);

      // Act & Assert
      await expect(productRepository.searchProducts(invalidQuery)).rejects.toThrow('Invalid query');
    });
  });
});
