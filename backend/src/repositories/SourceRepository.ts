import { PrismaClient } from "@prisma/client";
import { Source } from "../types/index";
import { SourceRepository } from "./interfaces";

export class PrismaSourceRepository implements SourceRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Source | null> {
    const source = await this.prisma.source.findUnique({
      where: { id },
    });
    if (!source) return null;
    
    return {
      ...source,
      category: source.category as 'popular' | 'alternative',
      configuration: source.configuration as any,
      lastSuccessfulScrape: source.lastSuccessfulScrape || undefined,
      averageResponseTime: source.averageResponseTime || undefined,
    };
  }

  async findAll(): Promise<Source[]> {
    const sources = await this.prisma.source.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    return sources.map(source => ({
      ...source,
      category: source.category as 'popular' | 'alternative',
      configuration: source.configuration as any,
      lastSuccessfulScrape: source.lastSuccessfulScrape || undefined,
      averageResponseTime: source.averageResponseTime || undefined,
    }));
  }

  async create(
    data: Omit<Source, "id" | "createdAt" | "updatedAt">
  ): Promise<Source> {
    const source = await this.prisma.source.create({
      data,
    });
    
    return {
      ...source,
      category: source.category as 'popular' | 'alternative',
      configuration: source.configuration as any,
      lastSuccessfulScrape: source.lastSuccessfulScrape || undefined,
      averageResponseTime: source.averageResponseTime || undefined,
    };
  }

  async update(
    id: string,
    data: Partial<Omit<Source, "id" | "createdAt" | "updatedAt">>
  ): Promise<Source | null> {
    try {
      const source = await this.prisma.source.update({
        where: { id },
        data,
      });
      
      return {
        ...source,
        category: source.category as 'popular' | 'alternative',
        configuration: source.configuration as any,
        lastSuccessfulScrape: source.lastSuccessfulScrape || undefined,
        averageResponseTime: source.averageResponseTime || undefined,
      };
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.source.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async findByCategory(category: string): Promise<Source[]> {
    const sources = await this.prisma.source.findMany({
      where: { category: category as any },
      orderBy: { name: "asc" },
    });
    
    return sources.map(source => ({
      ...source,
      category: source.category as 'popular' | 'alternative',
      configuration: source.configuration as any,
      lastSuccessfulScrape: source.lastSuccessfulScrape || undefined,
      averageResponseTime: source.averageResponseTime || undefined,
    }));
  }

  async findActive(): Promise<Source[]> {
    const sources = await this.prisma.source.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    
    return sources.map(source => ({
      ...source,
      category: source.category as 'popular' | 'alternative',
      configuration: source.configuration as any,
      lastSuccessfulScrape: source.lastSuccessfulScrape || undefined,
      averageResponseTime: source.averageResponseTime || undefined,
    }));
  }

  async findByName(name: string): Promise<Source | null> {
    const source = await this.prisma.source.findUnique({
      where: { name },
    });
    
    if (!source) return null;
    
    return {
      ...source,
      category: source.category as 'popular' | 'alternative',
      configuration: source.configuration as any,
      lastSuccessfulScrape: source.lastSuccessfulScrape || undefined,
      averageResponseTime: source.averageResponseTime || undefined,
    };
  }

  async updateLastSuccessfulScrape(id: string): Promise<Source | null> {
    try {
      const source = await this.prisma.source.update({
        where: { id },
        data: { lastSuccessfulScrape: new Date() },
      });
      
      return {
        ...source,
        category: source.category as 'popular' | 'alternative',
        configuration: source.configuration as any,
        lastSuccessfulScrape: source.lastSuccessfulScrape || undefined,
        averageResponseTime: source.averageResponseTime || undefined,
      };
    } catch (error) {
      return null;
    }
  }

  async incrementErrorCount(id: string): Promise<Source | null> {
    try {
      const source = await this.prisma.source.update({
        where: { id },
        data: {
          errorCount: {
            increment: 1,
          },
        },
      });
      
      return {
        ...source,
        category: source.category as 'popular' | 'alternative',
        configuration: source.configuration as any,
        lastSuccessfulScrape: source.lastSuccessfulScrape || undefined,
        averageResponseTime: source.averageResponseTime || undefined,
      };
    } catch (error) {
      return null;
    }
  }

  async resetErrorCount(id: string): Promise<Source | null> {
    try {
      const source = await this.prisma.source.update({
        where: { id },
        data: { errorCount: 0 },
      });
      
      return {
        ...source,
        category: source.category as 'popular' | 'alternative',
        configuration: source.configuration as any,
        lastSuccessfulScrape: source.lastSuccessfulScrape || undefined,
        averageResponseTime: source.averageResponseTime || undefined,
      };
    } catch (error) {
      return null;
    }
  }

  async updateAverageResponseTime(
    id: string,
    responseTime: number
  ): Promise<Source | null> {
    try {
      const source = await this.prisma.source.update({
        where: { id },
        data: { averageResponseTime: responseTime },
      });
      
      return {
        ...source,
        category: source.category as 'popular' | 'alternative',
        configuration: source.configuration as any,
        lastSuccessfulScrape: source.lastSuccessfulScrape || undefined,
        averageResponseTime: source.averageResponseTime || undefined,
      };
    } catch (error) {
      return null;
    }
  }
}
