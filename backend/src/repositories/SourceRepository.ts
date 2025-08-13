import { eq, desc } from "drizzle-orm";
import { getDb } from "../database/connection";
import { sources } from "../database/schema";
import { Source } from "../validation/schemas";

export class SourceRepository {
  // Get all active sources
  async getActiveSources(): Promise<Source[]> {
    const db = getDb();
    const results = await db
      .select()
      .from(sources)
      .where(eq(sources.isActive, true))
      .orderBy(desc(sources.lastSuccessfulScrape));

    const sourcesList: Source[] = [];
    for (const source of results) {
      if (source) {
        sourcesList.push({
          id: source.id,
          name: source.name,
          category: source.category,
          isActive: source.isActive,
          lastSuccessfulScrape: source.lastSuccessfulScrape?.toISOString(),
          errorCount: source.errorCount,
          averageResponseTime: source.averageResponseTime || undefined,
          configuration: source.configuration as Record<string, any>,
        });
      }
    }
    return sourcesList;
  }

  // Get source by ID
  async findById(id: string): Promise<Source | null> {
    const db = getDb();
    const result = await db
      .select()
      .from(sources)
      .where(eq(sources.id, id))
      .limit(1);

    if (result.length === 0) return null;

    const source = result[0];
    if (!source) return null;

    return {
      id: source.id,
      name: source.name,
      category: source.category,
      isActive: source.isActive,
      lastSuccessfulScrape: source.lastSuccessfulScrape?.toISOString(),
      errorCount: source.errorCount,
      averageResponseTime: source.averageResponseTime || undefined,
      configuration: source.configuration as Record<string, any>,
    };
  }

  // Update source health metrics
  async updateHealthMetrics(
    id: string,
    isSuccess: boolean,
    responseTime?: number
  ) {
    const db = getDb();
    const updates: any = {
      updatedAt: new Date(),
    };

    if (isSuccess) {
      updates.lastSuccessfulScrape = new Date();
      updates.errorCount = 0;
    } else {
      const currentSource = await this.findById(id);
      updates.errorCount = (currentSource?.errorCount || 0) + 1;
    }

    if (responseTime !== undefined) {
      // Calculate running average
      const currentSource = await this.findById(id);
      if (currentSource?.averageResponseTime) {
        updates.averageResponseTime = Math.round(
          (currentSource.averageResponseTime + responseTime) / 2
        );
      } else {
        updates.averageResponseTime = responseTime;
      }
    }

    await db.update(sources).set(updates).where(eq(sources.id, id));
  }

  // Create a new source
  async create(
    source: Omit<
      Source,
      "id" | "lastSuccessfulScrape" | "errorCount" | "averageResponseTime"
    >
  ): Promise<Source> {
    const db = getDb();
    const [result] = await db
      .insert(sources)
      .values({
        name: source.name,
        category: source.category,
        isActive: source.isActive,
        configuration: source.configuration,
      })
      .returning();

    if (!result) {
      throw new Error("Failed to create source");
    }

    return {
      id: result.id,
      name: result.name,
      category: result.category,
      isActive: result.isActive,
      lastSuccessfulScrape: result.lastSuccessfulScrape?.toISOString(),
      errorCount: result.errorCount,
      averageResponseTime: result.averageResponseTime || undefined,
      configuration: result.configuration as Record<string, any>,
    };
  }

  // Update source
  async update(
    id: string,
    updates: Partial<
      Omit<
        Source,
        "id" | "lastSuccessfulScrape" | "errorCount" | "averageResponseTime"
      >
    >
  ): Promise<Source | null> {
    const db = getDb();
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.configuration !== undefined)
      updateData.configuration = updates.configuration;

    const [result] = await db
      .update(sources)
      .set(updateData)
      .where(eq(sources.id, id))
      .returning();

    if (!result) return null;

    return {
      id: result.id,
      name: result.name,
      category: result.category,
      isActive: result.isActive,
      lastSuccessfulScrape: result.lastSuccessfulScrape?.toISOString(),
      errorCount: result.errorCount,
      averageResponseTime: result.averageResponseTime || undefined,
      configuration: result.configuration as Record<string, any>,
    };
  }

  // Delete source
  async delete(id: string): Promise<boolean> {
    const db = getDb();
    await db.delete(sources).where(eq(sources.id, id));
    return true; // Assume success if no error thrown
  }
}
