import { PrismaClient } from "@prisma/client";
import { AdvertisementRepository as IAdvertisementRepository } from "./interfaces.js";
import {
  createAdvertisementSchema,
  updateAdvertisementSchema,
} from "../types/validation.js";

export class AdvertisementRepository implements IAdvertisementRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<any | null> {
    try {
      return await this.prisma.advertisement.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error("Error finding advertisement by ID:", error);
      return null;
    }
  }

  async findAll(): Promise<any[]> {
    try {
      return await this.prisma.advertisement.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("Error finding all advertisements:", error);
      return [];
    }
  }

  async create(data: any): Promise<any> {
    try {
      const validatedData = createAdvertisementSchema.parse(data);
      return await this.prisma.advertisement.create({
        data: validatedData,
      });
    } catch (error) {
      console.error("Error creating advertisement:", error);
      throw error;
    }
  }

  async update(id: string, data: any): Promise<any | null> {
    try {
      const validatedData = updateAdvertisementSchema.partial().parse(data);
      return await this.prisma.advertisement.update({
        where: { id },
        data: validatedData,
      });
    } catch (error) {
      console.error("Error updating advertisement:", error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.advertisement.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Error deleting advertisement:", error);
      return false;
    }
  }

  async findByActive(isActive: boolean): Promise<any[]> {
    try {
      return await this.prisma.advertisement.findMany({
        where: { isActive },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("Error finding advertisements by active status:", error);
      return [];
    }
  }

  async findByCategory(category: string): Promise<any[]> {
    try {
      return await this.prisma.advertisement.findMany({
        where: {
          category,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("Error finding advertisements by category:", error);
      return [];
    }
  }

  async incrementImpressions(id: string): Promise<any | null> {
    try {
      return await this.prisma.advertisement.update({
        where: { id },
        data: {
          impressions: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.error("Error incrementing advertisement impressions:", error);
      return null;
    }
  }

  async incrementClicks(id: string): Promise<any | null> {
    try {
      return await this.prisma.advertisement.update({
        where: { id },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.error("Error incrementing advertisement clicks:", error);
      return null;
    }
  }

  async findByKeywords(keywords: string[]): Promise<any[]> {
    try {
      return await this.prisma.advertisement.findMany({
        where: {
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          AND: [
            {
              OR: keywords.map((keyword) => ({
                OR: [
                  { title: { contains: keyword, mode: "insensitive" } },
                  { description: { contains: keyword, mode: "insensitive" } },
                  { keywords: { has: keyword } },
                ],
              })),
            },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("Error finding advertisements by keywords:", error);
      return [];
    }
  }

  async findExpired(): Promise<any[]> {
    try {
      return await this.prisma.advertisement.findMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
          isActive: true,
        },
        orderBy: { expiresAt: "asc" },
      });
    } catch (error) {
      console.error("Error finding expired advertisements:", error);
      return [];
    }
  }

  async deactivateExpired(): Promise<number> {
    try {
      const result = await this.prisma.advertisement.updateMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
      return result.count;
    } catch (error) {
      console.error("Error deactivating expired advertisements:", error);
      return 0;
    }
  }

  async getPerformanceStats(): Promise<any> {
    try {
      const ads = await this.prisma.advertisement.findMany({
        select: {
          id: true,
          title: true,
          impressions: true,
          clicks: true,
          category: true,
          createdAt: true,
        },
      });

      const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
      const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
      const overallCTR =
        totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      const categoryStats = ads.reduce((acc, ad) => {
        if (!acc[ad.category]) {
          acc[ad.category] = { impressions: 0, clicks: 0, count: 0 };
        }
        acc[ad.category].impressions += ad.impressions;
        acc[ad.category].clicks += ad.clicks;
        acc[ad.category].count += 1;
        return acc;
      }, {} as Record<string, { impressions: number; clicks: number; count: number }>);

      return {
        totalAdvertisements: ads.length,
        totalImpressions,
        totalClicks,
        overallClickThroughRate: overallCTR.toFixed(2),
        categoryStats,
      };
    } catch (error) {
      console.error("Error getting advertisement performance stats:", error);
      return {
        totalAdvertisements: 0,
        totalImpressions: 0,
        totalClicks: 0,
        overallClickThroughRate: "0.00",
        categoryStats: {},
      };
    }
  }
}
