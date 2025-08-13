import { AdvertisementService } from '../advertisementService';

describe('AdvertisementService', () => {
  let advertisementService: AdvertisementService;

  beforeEach(() => {
    // Create AdvertisementService instance
    advertisementService = new AdvertisementService();
  });

  describe('getRelevantAdvertisements', () => {
    it('should return advertisements matching search query', async () => {
      // Arrange
      const searchQuery = 'smartphone';
      const maxResults = 3;

      // Act
      const result = await advertisementService.getRelevantAdvertisements(searchQuery, maxResults);

      // Assert
      expect(result).toBeDefined();
      expect(result.advertisements).toBeInstanceOf(Array);
      expect(result.advertisements.length).toBeLessThanOrEqual(maxResults);
      
      // Check that advertisements have required properties
      result.advertisements.forEach(ad => {
        expect(ad).toHaveProperty('id');
        expect(ad).toHaveProperty('title');
        expect(ad).toHaveProperty('description');
        expect(ad).toHaveProperty('imageUrl');
        expect(ad).toHaveProperty('targetUrl');
        expect(ad).toHaveProperty('keywords');
        expect(ad).toHaveProperty('isActive');
      });
    });

    it('should filter advertisements by keywords', async () => {
      // Arrange
      const searchQuery = 'laptop';
      const maxResults = 5;

      // Act
      const result = await advertisementService.getRelevantAdvertisements(searchQuery, maxResults);

      // Assert
      expect(result.advertisements.length).toBeGreaterThan(0);
      
      // Check that at least one advertisement has relevant keywords
      const hasRelevantAd = result.advertisements.some(ad => 
        ad.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
          searchQuery.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      expect(hasRelevantAd).toBe(true);
    });

    it('should respect maxResults limit', async () => {
      // Arrange
      const searchQuery = 'electronics';
      const maxResults = 2;

      // Act
      const result = await advertisementService.getRelevantAdvertisements(searchQuery, maxResults);

      // Assert
      expect(result.advertisements.length).toBeLessThanOrEqual(maxResults);
    });

    it('should return only active advertisements', async () => {
      // Arrange
      const searchQuery = 'phone';
      const maxResults = 10;

      // Act
      const result = await advertisementService.getRelevantAdvertisements(searchQuery, maxResults);

      // Assert
      result.advertisements.forEach(ad => {
        expect(ad.isActive).toBe(true);
      });
    });

    it('should handle empty search query', async () => {
      // Arrange
      const searchQuery = '';
      const maxResults = 5;

      // Act
      const result = await advertisementService.getRelevantAdvertisements(searchQuery, maxResults);

      // Assert
      expect(result.advertisements).toBeInstanceOf(Array);
      expect(result.advertisements.length).toBeLessThanOrEqual(maxResults);
    });

    it('should handle very specific search queries', async () => {
      // Arrange
      const searchQuery = 'iPhone 15 Pro Max 256GB';
      const maxResults = 3;

      // Act
      const result = await advertisementService.getRelevantAdvertisements(searchQuery, maxResults);

      // Assert
      expect(result.advertisements).toBeInstanceOf(Array);
      expect(result.advertisements.length).toBeLessThanOrEqual(maxResults);
    });
  });

  describe('getAdvertisementById', () => {
    it('should return advertisement by ID', async () => {
      // Arrange
      const adId = 'ad_1';

      // Act
      const result = await advertisementService.getAdvertisementById(adId);

      // Assert
      expect(result).toBeDefined();
      expect(result!.id).toBe(adId);
      expect(result!).toHaveProperty('title');
      expect(result!).toHaveProperty('description');
    });

    it('should return null for non-existent advertisement', async () => {
      // Arrange
      const adId = 'non_existent_ad';

      // Act
      const result = await advertisementService.getAdvertisementById(adId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getRandomAdvertisements', () => {
    it('should return random advertisements', async () => {
      // Arrange
      const count = 3;

      // Act
      const result = await advertisementService.getRandomAdvertisements(count);

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeLessThanOrEqual(count);
      
      result.forEach(ad => {
        expect(ad).toHaveProperty('id');
        expect(ad).toHaveProperty('title');
        expect(ad).toHaveProperty('isActive');
        expect(ad.isActive).toBe(true);
      });
    });

    it('should respect count limit', async () => {
      // Arrange
      const count = 1;

      // Act
      const result = await advertisementService.getRandomAdvertisements(count);

      // Assert
      expect(result.length).toBeLessThanOrEqual(count);
    });

    it('should return different advertisements on multiple calls', async () => {
      // Arrange
      const count = 2;

      // Act
      const result1 = await advertisementService.getRandomAdvertisements(count);
      const result2 = await advertisementService.getRandomAdvertisements(count);

      // Assert
      // Note: This test might occasionally fail due to randomness, but it's unlikely
      // that both calls would return exactly the same advertisements
      const ids1 = result1.map(ad => ad.id).sort();
      const ids2 = result2.map(ad => ad.id).sort();
      
      // At least one advertisement should be different
      const hasDifferentAd = ids1.some(id => !ids2.includes(id)) || 
                            ids2.some(id => !ids1.includes(id));
      expect(hasDifferentAd).toBe(true);
    });
  });

  describe('trackAdvertisementClick', () => {
    it('should track advertisement click', async () => {
      // Arrange
      const adId = 'ad_1';

      // Act
      const result = await advertisementService.trackAdvertisementClick(adId);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle tracking for non-existent advertisement', async () => {
      // Arrange
      const adId = 'non_existent_ad';

      // Act
      const result = await advertisementService.trackAdvertisementClick(adId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getAdvertisementStats', () => {
    it('should return advertisement statistics', async () => {
      // Act
      const result = await advertisementService.getAdvertisementStats();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalAdvertisements');
      expect(result).toHaveProperty('activeAdvertisements');
      expect(result).toHaveProperty('totalClicks');
      expect(result).toHaveProperty('averageClickRate');
      
      expect(result.totalAdvertisements).toBeGreaterThan(0);
      expect(result.activeAdvertisements).toBeGreaterThan(0);
      expect(result.totalClicks).toBeGreaterThanOrEqual(0);
      expect(result.averageClickRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('data quality', () => {
    it('should have valid advertisement data', async () => {
      // Arrange
      const searchQuery = 'test';
      const maxResults = 10;

      // Act
      const result = await advertisementService.getRelevantAdvertisements(searchQuery, maxResults);

      // Assert
      result.advertisements.forEach(ad => {
        // Check required string properties are not empty
        expect(ad.title.trim()).toBeTruthy();
        expect(ad.description.trim()).toBeTruthy();
        expect(ad.imageUrl.trim()).toBeTruthy();
        expect(ad.targetUrl.trim()).toBeTruthy();
        
        // Check keywords array is not empty
        expect(ad.keywords.length).toBeGreaterThan(0);
        ad.keywords.forEach(keyword => {
          expect(keyword.trim()).toBeTruthy();
        });
        
        // Check URLs are valid
        expect(ad.imageUrl).toMatch(/^https?:\/\//);
        expect(ad.targetUrl).toMatch(/^https?:\/\//);
      });
    });

    it('should have consistent advertisement IDs', async () => {
      // Arrange
      const searchQuery = 'electronics';
      const maxResults = 10;

      // Act
      const result = await advertisementService.getRelevantAdvertisements(searchQuery, maxResults);

      // Assert
      const ids = result.advertisements.map(ad => ad.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length); // No duplicate IDs
    });
  });
});
