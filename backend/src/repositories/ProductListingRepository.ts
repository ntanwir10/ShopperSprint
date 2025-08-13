import { PrismaClient } from "@prisma/client";
import { ProductListing } from "../types/index";
import { ProductListingRepository } from "./interfaces";

export class PrismaProductListingRepository
  implements ProductListingRepository
{
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<ProductListing | null> {
    const listing = await this.prisma.productListing.findUnique({
      where: { id },
    });
    if (!listing) return null;

    return {
      ...listing,
      availability: listing.availability as
        | "in_stock"
        | "out_of_stock"
        | "limited"
        | "unknown",
      imageUrl: listing.imageUrl || undefined,
      rating: listing.rating || undefined,
      reviewCount: listing.reviewCount || undefined,
    };
  }

  async findAll(): Promise<ProductListing[]> {
    const listings = await this.prisma.productListing.findMany({
      orderBy: { lastScraped: "desc" },
    });

    return listings.map((listing) => ({
      ...listing,
      availability: listing.availability as
        | "in_stock"
        | "out_of_stock"
        | "limited"
        | "unknown",
      imageUrl: listing.imageUrl || undefined,
      rating: listing.rating || undefined,
      reviewCount: listing.reviewCount || undefined,
    }));
  }

  async create(
    data: Omit<ProductListing, "id" | "lastScraped">
  ): Promise<ProductListing> {
    const listing = await this.prisma.productListing.create({
      data: {
        ...data,
        lastScraped: new Date(),
      },
    });

    return {
      ...listing,
      availability: listing.availability as
        | "in_stock"
        | "out_of_stock"
        | "limited"
        | "unknown",
      imageUrl: listing.imageUrl || undefined,
      rating: listing.rating || undefined,
      reviewCount: listing.reviewCount || undefined,
    };
  }

  async update(
    id: string,
    data: Partial<Omit<ProductListing, "id" | "lastScraped">>
  ): Promise<ProductListing | null> {
    try {
      const listing = await this.prisma.productListing.update({
        where: { id },
        data,
      });

      return {
        ...listing,
        availability: listing.availability as
          | "in_stock"
          | "out_of_stock"
          | "limited"
          | "unknown",
        imageUrl: listing.imageUrl || undefined,
        rating: listing.rating || undefined,
        reviewCount: listing.reviewCount || undefined,
      };
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.productListing.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async findByProductId(productId: string): Promise<ProductListing[]> {
    const listings = await this.prisma.productListing.findMany({
      where: { productId },
      orderBy: { lastScraped: "desc" },
    });
    
    return listings.map(listing => ({
      ...listing,
      availability: listing.availability as 'in_stock' | 'out_of_stock' | 'limited' | 'unknown',
      imageUrl: listing.imageUrl || undefined,
      rating: listing.rating || undefined,
      reviewCount: listing.reviewCount || undefined,
    }));
  }

  async findBySourceId(sourceId: string): Promise<ProductListing[]> {
    const listings = await this.prisma.productListing.findMany({
      where: { sourceId },
      orderBy: { lastScraped: "desc" },
    });
    
    return listings.map(listing => ({
      ...listing,
      availability: listing.availability as 'in_stock' | 'out_of_stock' | 'limited' | 'unknown',
      imageUrl: listing.imageUrl || undefined,
      rating: listing.rating || undefined,
      reviewCount: listing.reviewCount || undefined,
    }));
  }

  async findByProductAndSource(
    productId: string,
    sourceId: string
  ): Promise<ProductListing | null> {
    const listing = await this.prisma.productListing.findFirst({
      where: { productId, sourceId },
    });
    
    if (!listing) return null;
    
    return {
      ...listing,
      availability: listing.availability as 'in_stock' | 'out_of_stock' | 'limited' | 'unknown',
      imageUrl: listing.imageUrl || undefined,
      rating: listing.rating || undefined,
      reviewCount: listing.reviewCount || undefined,
    };
  }

  async findValidListings(): Promise<ProductListing[]> {
    const listings = await this.prisma.productListing.findMany({
      where: { isValid: true },
      orderBy: { lastScraped: "desc" },
    });
    
    return listings.map(listing => ({
      ...listing,
      availability: listing.availability as 'in_stock' | 'out_of_stock' | 'limited' | 'unknown',
      imageUrl: listing.imageUrl || undefined,
      rating: listing.rating || undefined,
      reviewCount: listing.reviewCount || undefined,
    }));
  }

  async findByAvailability(availability: string): Promise<ProductListing[]> {
    const listings = await this.prisma.productListing.findMany({
      where: { availability: availability as any },
      orderBy: { lastScraped: "desc" },
    });
    
    return listings.map(listing => ({
      ...listing,
      availability: listing.availability as 'in_stock' | 'out_of_stock' | 'limited' | 'unknown',
      imageUrl: listing.imageUrl || undefined,
      rating: listing.rating || undefined,
      reviewCount: listing.reviewCount || undefined,
    }));
  }

  async updateLastScraped(id: string): Promise<ProductListing | null> {
    try {
      const listing = await this.prisma.productListing.update({
        where: { id },
        data: { lastScraped: new Date() },
      });
      
      return {
        ...listing,
        availability: listing.availability as 'in_stock' | 'out_of_stock' | 'limited' | 'unknown',
        imageUrl: listing.imageUrl || undefined,
        rating: listing.rating || undefined,
        reviewCount: listing.reviewCount || undefined,
      };
    } catch (error) {
      return null;
    }
  }
}
