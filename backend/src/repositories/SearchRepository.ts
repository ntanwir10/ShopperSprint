import { PrismaClient } from "@prisma/client";
import { Search } from "../types/index";
import { SearchRepository } from "./interfaces";

export class PrismaSearchRepository implements SearchRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Search | null> {
    const search = await this.prisma.search.findUnique({
      where: { id },
    });
    if (!search) return null;
    
    return {
      ...search,
      userId: search.userId || undefined,
      metadata: search.metadata as any || undefined,
    };
  }

  async findAll(): Promise<Search[]> {
    const searches = await this.prisma.search.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    return searches.map(search => ({
      ...search,
      userId: search.userId || undefined,
      metadata: search.metadata as any || undefined,
    }));
  }

  async create(
    data: Omit<Search, "id" | "createdAt">
  ): Promise<Search> {
    const search = await this.prisma.search.create({
      data,
    });
    
    return {
      ...search,
      userId: search.userId || undefined,
      metadata: search.metadata as any || undefined,
    };
  }

  async update(
    id: string,
    data: Partial<Omit<Search, "id" | "createdAt">>
  ): Promise<Search | null> {
    try {
      const search = await this.prisma.search.update({
        where: { id },
        data,
      });
      
      return {
        ...search,
        userId: search.userId || undefined,
        metadata: search.metadata as any || undefined,
      };
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.search.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async findByQuery(query: string): Promise<Search[]> {
    const searches = await this.prisma.search.findMany({
      where: { query },
      orderBy: { createdAt: "desc" },
    });
    
    return searches.map(search => ({
      ...search,
      userId: search.userId || undefined,
      metadata: search.metadata as any || undefined,
    }));
  }

  async findByUserId(userId: string): Promise<Search[]> {
    const searches = await this.prisma.search.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    
    return searches.map(search => ({
      ...search,
      userId: search.userId || undefined,
      metadata: search.metadata as any || undefined,
    }));
  }

  async findRecent(limit: number = 10): Promise<Search[]> {
    const searches = await this.prisma.search.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    
    return searches.map(search => ({
      ...search,
      userId: search.userId || undefined,
      metadata: search.metadata as any || undefined,
    }));
  }
}
