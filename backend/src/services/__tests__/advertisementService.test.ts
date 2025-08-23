import { AdvertisementService } from '../advertisementService';
import { AdvertisementRequest, AdvertisementTrackRequest } from '../../validation/schemas';

describe('AdvertisementService', () => {
  let advertisementService: AdvertisementService;

  beforeEach(() => {
    advertisementService = new AdvertisementService();
  });

  describe('getAdvertisements', () => {
    it('should return all advertisements when no category filter', async () => {
      // Arrange
      const request: AdvertisementRequest = {};

      // Act
      const result = await advertisementService.getAdvertisements(request);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(ad => {
        expect(ad).toHaveProperty('id');
        expect(ad).toHaveProperty('title');
        expect(ad).toHaveProperty('description');
        expect(ad).toHaveProperty('imageUrl');
        expect(ad).toHaveProperty('targetUrl');
        expect(ad).toHaveProperty('category');
      });
    });

    it('should filter advertisements by category', async () => {
      // Arrange
      const request: AdvertisementRequest = {
        category: 'electronics'
      };

      // Act
      const result = await advertisementService.getAdvertisements(request);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      result.forEach(ad => {
        expect(ad.category).toBe('electronics');
      });
    });

    it('should return empty array for non-existent category', async () => {
      // Arrange
      const request: AdvertisementRequest = {
        category: 'nonexistent'
      };

      // Act
      const result = await advertisementService.getAdvertisements(request);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return promotion category advertisements', async () => {
      // Arrange
      const request: AdvertisementRequest = {
        category: 'promotion'
      };

      // Act
      const result = await advertisementService.getAdvertisements(request);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(ad => {
        expect(ad.category).toBe('promotion');
      });
    });
  });

  describe('trackEvent', () => {
    it('should track advertisement click event', async () => {
      // Arrange
      const request: AdvertisementTrackRequest = {
        adId: 'ad_1',
        event: 'click',
        searchId: 'search_123'
      };

      // Act
      const result = await advertisementService.trackEvent(request);

      // Assert
      expect(result).toBe(true);
    });

    it('should track advertisement impression event', async () => {
      // Arrange
      const request: AdvertisementTrackRequest = {
        adId: 'ad_2',
        event: 'impression',
        searchId: 'search_456'
      };

      // Act
      const result = await advertisementService.trackEvent(request);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle tracking for non-existent advertisement', async () => {
      // Arrange
      const request: AdvertisementTrackRequest = {
        adId: 'non_existent_ad',
        event: 'click',
        searchId: 'search_789'
      };

      // Act
      const result = await advertisementService.trackEvent(request);

      // Assert
      expect(result).toBe(true); // Service always returns true for mock implementation
    });

    it('should handle tracking without searchId', async () => {
      // Arrange
      const request: AdvertisementTrackRequest = {
        adId: 'ad_1',
        event: 'click'
      };

      // Act
      const result = await advertisementService.trackEvent(request);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle invalid advertisement requests gracefully', async () => {
      // Arrange
      const request = {} as AdvertisementRequest;

      // Act & Assert
      await expect(advertisementService.getAdvertisements(request)).resolves.toBeDefined();
    });

    it('should handle invalid tracking requests gracefully', async () => {
      // Arrange
      const request = {
        adId: '',
        event: 'click'
      } as AdvertisementTrackRequest;

      // Act & Assert
      await expect(advertisementService.trackEvent(request)).resolves.toBe(true);
    });
  });
});
