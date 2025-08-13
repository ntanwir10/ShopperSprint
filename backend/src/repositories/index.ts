// Export all repository implementations
export { PrismaProductRepository as ProductRepository } from "./ProductRepository";
export { PrismaProductListingRepository as ProductListingRepository } from "./ProductListingRepository";
export { PrismaSearchRepository as SearchRepository } from "./SearchRepository";
export { PrismaSourceRepository as SourceRepository } from "./SourceRepository";
export { AdvertisementRepository } from "./AdvertisementRepository";

// Export repository interfaces
export type {
  ProductRepository as IProductRepository,
  ProductListingRepository as IProductListingRepository,
  SearchRepository as ISearchRepository,
  SourceRepository as ISourceRepository,
  AdvertisementRepository as IAdvertisementRepository,
} from "./interfaces";

// Export base repository interface
export type { BaseRepository } from "./interfaces";

import { PrismaClient } from "@prisma/client";
import { PrismaProductRepository } from "./ProductRepository";
import { PrismaProductListingRepository } from "./ProductListingRepository";
import { PrismaSearchRepository } from "./SearchRepository";
import { PrismaSourceRepository } from "./SourceRepository";
import { AdvertisementRepository } from "./AdvertisementRepository";

export class RepositoryFactory {
  constructor(private prisma: PrismaClient) {}

  createProductRepository() {
    return new PrismaProductRepository(this.prisma);
  }

  createProductListingRepository() {
    return new PrismaProductListingRepository(this.prisma);
  }

  createSearchRepository() {
    return new PrismaSearchRepository(this.prisma);
  }

  createSourceRepository() {
    return new PrismaSourceRepository(this.prisma);
  }

  createAdvertisementRepository() {
    return new AdvertisementRepository(this.prisma);
  }
}
