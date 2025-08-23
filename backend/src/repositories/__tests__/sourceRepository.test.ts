import { SourceRepository } from '../sourceRepository';
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

describe('SourceRepository', () => {
  let sourceRepository: SourceRepository;
  let mockedDb: jest.Mocked<typeof db>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Get mocked database
    mockedDb = db as jest.Mocked<typeof db>;

    // Create SourceRepository instance
    sourceRepository = new SourceRepository();
  });

  describe('getActiveSources', () => {
    it('should return all active sources', async () => {
      // Arrange
      const mockSources = [
        {
          id: 'source1',
          name: 'Amazon',
          category: 'popular',
          isActive: true,
          errorCount: 0,
          configuration: {
            baseUrl: 'https://amazon.com',
            searchUrl: 'https://amazon.com/s',
            rateLimit: 1000,
          },
          lastSuccessfulScrape: new Date(),
          averageResponseTime: 500,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'source2',
          name: 'Walmart',
          category: 'alternative',
          isActive: true,
          errorCount: 2,
          configuration: {
            baseUrl: 'https://walmart.com',
            searchUrl: 'https://walmart.com/search',
            rateLimit: 1500,
          },
          lastSuccessfulScrape: new Date(),
          averageResponseTime: 800,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue(mockSources),
          }),
        }),
      } as any);

      // Act
      const result = await sourceRepository.getActiveSources();

      // Assert
      expect(result).toEqual(mockSources);
      expect(result.length).toBe(2);
      expect(mockedDb.select).toHaveBeenCalled();
    });

    it('should return empty array when no active sources exist', async () => {
      // Arrange
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Act
      const result = await sourceRepository.getActiveSources();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
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
      const result = await sourceRepository.findById(sourceId);

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
      const result = await sourceRepository.findById(sourceId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createSource', () => {
    it('should create a new source', async () => {
      // Arrange
      const sourceData = {
        name: 'New Store',
        category: 'alternative',
        configuration: {
          baseUrl: 'https://newstore.com',
          searchUrl: 'https://newstore.com/search',
          rateLimit: 2000,
        },
      };

      const mockInsertedSource = {
        id: 'new_source_id',
        ...sourceData,
        isActive: true,
        errorCount: 0,
        lastSuccessfulScrape: null,
        averageResponseTime: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockInsertedSource]),
        }),
      } as any);

      // Act
      const result = await sourceRepository.createSource(sourceData);

      // Assert
      expect(result).toEqual(mockInsertedSource);
      expect(mockedDb.insert).toHaveBeenCalled();
    });

    it('should handle creation errors gracefully', async () => {
      // Arrange
      const sourceData = {
        name: 'New Store',
        category: 'alternative',
        configuration: {
          baseUrl: 'https://newstore.com',
          searchUrl: 'https://newstore.com/search',
          rateLimit: 2000,
        },
      };

      mockedDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      } as any);

      // Act & Assert
      await expect(sourceRepository.createSource(sourceData)).rejects.toThrow('Database error');
    });
  });

  describe('updateSource', () => {
    it('should update an existing source', async () => {
      // Arrange
      const sourceId = 'test_source_id';
      const updates = {
        name: 'Updated Store Name',
        isActive: false,
        errorCount: 5,
      };

      const mockUpdatedSource = {
        id: sourceId,
        name: 'Updated Store Name',
        category: 'popular',
        isActive: false,
        errorCount: 5,
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

      mockedDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([mockUpdatedSource]),
            }),
          }),
        }),
      } as any);

      // Act
      const result = await sourceRepository.updateSource(sourceId, updates);

      // Assert
      expect(result).toEqual(mockUpdatedSource);
      expect(mockedDb.update).toHaveBeenCalled();
    });

    it('should return null for non-existent source update', async () => {
      // Arrange
      const sourceId = 'non_existent_source';
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
      const result = await sourceRepository.updateSource(sourceId, updates);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('deleteSource', () => {
    it('should delete an existing source', async () => {
      // Arrange
      const sourceId = 'test_source_id';
      mockedDb.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: sourceId }]),
          }),
        }),
      } as any);

      // Act
      const result = await sourceRepository.deleteSource(sourceId);

      // Assert
      expect(result).toBe(true);
      expect(mockedDb.delete).toHaveBeenCalled();
    });

    it('should return false for non-existent source deletion', async () => {
      // Arrange
      const sourceId = 'non_existent_source';
      mockedDb.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Act
      const result = await sourceRepository.deleteSource(sourceId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getSourcesByCategory', () => {
    it('should return sources by category', async () => {
      // Arrange
      const category = 'popular';
      const mockSources = [
        {
          id: 'source1',
          name: 'Amazon',
          category: 'popular',
          isActive: true,
          errorCount: 0,
          configuration: {
            baseUrl: 'https://amazon.com',
            searchUrl: 'https://amazon.com/s',
            rateLimit: 1000,
          },
          lastSuccessfulScrape: new Date(),
          averageResponseTime: 500,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue(mockSources),
          }),
        }),
      } as any);

      // Act
      const result = await sourceRepository.getSourcesByCategory(category);

      // Assert
      expect(result).toEqual(mockSources);
      expect(result.length).toBe(1);
      expect(mockedDb.select).toHaveBeenCalled();
    });

    it('should return empty array for non-existent category', async () => {
      // Arrange
      const category = 'non_existent_category';
      mockedDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      // Act
      const result = await sourceRepository.getSourcesByCategory(category);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('updateSourceStats', () => {
    it('should update source statistics', async () => {
      // Arrange
      const sourceId = 'test_source_id';
      const stats = {
        errorCount: 3,
        lastSuccessfulScrape: new Date(),
        averageResponseTime: 750,
      };

      const mockUpdatedSource = {
        id: sourceId,
        name: 'Test Store',
        category: 'popular',
        isActive: true,
        errorCount: 3,
        configuration: {
          baseUrl: 'https://teststore.com',
          searchUrl: 'https://teststore.com/search',
          rateLimit: 1000,
        },
        lastSuccessfulScrape: stats.lastSuccessfulScrape,
        averageResponseTime: 750,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([mockUpdatedSource]),
            }),
          }),
        }),
      } as any);

      // Act
      const result = await sourceRepository.updateSourceStats(sourceId, stats);

      // Assert
      expect(result).toEqual(mockUpdatedSource);
      expect(mockedDb.update).toHaveBeenCalled();
    });

    it('should return null for non-existent source stats update', async () => {
      // Arrange
      const sourceId = 'non_existent_source';
      const stats = {
        errorCount: 1,
        lastSuccessfulScrape: new Date(),
        averageResponseTime: 500,
      };

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
      const result = await sourceRepository.updateSourceStats(sourceId, stats);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      const sourceId = 'test_source';
      mockedDb.select.mockImplementation(() => {
        throw new Error('Connection failed');
      });

      // Act & Assert
      await expect(sourceRepository.findById(sourceId)).rejects.toThrow('Connection failed');
    });

    it('should handle invalid update data', async () => {
      // Arrange
      const sourceId = 'test_source';
      const invalidUpdates = { invalidField: 'invalid_value' };

      mockedDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              returning: jest.fn().mockRejectedValue(new Error('Invalid field')),
            }),
          }),
        }),
      } as any);

      // Act & Assert
      await expect(sourceRepository.updateSource(sourceId, invalidUpdates)).rejects.toThrow('Invalid field');
    });
  });
});
