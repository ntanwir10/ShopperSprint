import { PrismaClient } from "@prisma/client";
import { Product } from "../types/index";
import { ProductRepository } from "./interfaces";

export class PrismaProductRepository implements ProductRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) return null;

    return {
      ...product,
      category: product.category || undefined,
      specifications: (product.specifications as Record<string, unknown>) || {},
    };
  }

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => ({
      ...product,
      category: product.category || undefined,
      specifications: (product.specifications as Record<string, unknown>) || {},
    }));
  }

  async create(
    data: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> {
    const product = await this.prisma.product.create({
      data: {
        ...data,
        specifications: (data.specifications as any) || {},
      },
    });

    return {
      ...product,
      category: product.category || undefined,
      specifications: (product.specifications as Record<string, unknown>) || {},
    };
  }

  async update(
    id: string,
    data: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>
  ): Promise<Product | null> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: {
          ...data,
          specifications: (data.specifications as any) || {},
        },
      });

      return {
        ...product,
        category: product.category || undefined,
        specifications:
          (product.specifications as Record<string, unknown>) || {},
      };
    } catch (error) {
      // Handle case where product doesn't exist
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async findByNormalizedName(normalizedName: string): Promise<Product | null> {
    const product = await this.prisma.product.findFirst({
      where: { normalizedName },
    });
    if (!product) return null;

    return {
      ...product,
      category: product.category || undefined,
      specifications: (product.specifications as Record<string, unknown>) || {},
    };
  }

  async findByCategory(category: string): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { category },
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => ({
      ...product,
      category: product.category || undefined,
      specifications: (product.specifications as Record<string, unknown>) || {},
    }));
  }

  async search(query: string): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            normalizedName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => ({
      ...product,
      category: product.category || undefined,
      specifications: (product.specifications as Record<string, unknown>) || {},
    }));
  }
}
