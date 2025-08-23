import { Router, Request, Response } from "express";
import { PriceHistoryService } from "../services/priceHistoryService";
import { ProductRepository } from "../repositories/ProductRepository";

const router = Router();
const productRepository = new ProductRepository();
const priceHistoryService = new PriceHistoryService(productRepository);

// GET /api/price-history/compare/:productId
router.get("/compare/:productId", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Product ID is required",
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const comparison = await priceHistoryService.getPriceComparison(productId);

    if (!comparison) {
      return res.status(404).json({
        error: "NotFound",
        message: "Product not found or no price data available",
        statusCode: 404,
        timestamp: new Date().toISOString(),
      });
    }

    return res.json(comparison);
  } catch (error) {
    console.error("Price comparison error:", error);
    return res.status(500).json({
      error: "PriceComparisonError",
      message: "Failed to get price comparison",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/price-history/:productId
router.get("/:productId", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { sourceId, days } = req.query;

    if (!productId) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Product ID is required",
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const historyDays = days ? parseInt(days as string) : 30;
    const history = await priceHistoryService.getPriceHistory(
      productId,
      sourceId as string | undefined,
      historyDays
    );

    return res.json({
      productId,
      history,
      metadata: {
        totalEntries: history.length,
        dateRange: {
          start:
            history.length > 0
              ? history[history.length - 1]?.timestamp || null
              : null,
          end: history.length > 0 ? history[0]?.timestamp || null : null,
        },
        days: historyDays,
      },
    });
  } catch (error) {
    console.error("Price history error:", error);
    return res.status(500).json({
      error: "PriceHistoryError",
      message: "Failed to get price history",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/price-history/alert
router.post("/alert", async (req: Request, res: Response) => {
  try {
    const { productId, targetPrice } = req.body;

    if (!productId || targetPrice === undefined) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Product ID and target price are required",
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const alert = await priceHistoryService.getPriceAlerts(
      productId,
      targetPrice
    );

    return res.json({
      productId,
      targetPrice,
      alert,
      message: alert.shouldAlert
        ? `Price alert! Current best price is $${(
            alert.currentBestPrice / 100
          ).toFixed(2)} (${alert.savingsPercent.toFixed(1)}% below target)`
        : `No alert needed. Current best price is $${(
            alert.currentBestPrice / 100
          ).toFixed(2)}`,
    });
  } catch (error) {
    console.error("Price alert error:", error);
    return res.status(500).json({
      error: "PriceAlertError",
      message: "Failed to check price alerts",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/price-history/sources/:productId
router.get("/sources/:productId", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Product ID is required",
        statusCode: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const comparison = await priceHistoryService.getPriceComparison(productId);

    if (!comparison) {
      return res.status(404).json({
        error: "NotFound",
        message: "Product not found or no price data available",
        statusCode: 404,
        timestamp: new Date().toISOString(),
      });
    }

    // Extract unique sources with their latest prices
    const sources = comparison.currentPrices.map((price) => ({
      sourceId: price.sourceId,
      sourceName: price.sourceName,
      currentPrice: price.price,
      currency: price.currency,
      lastUpdated: price.lastUpdated,
    }));

    return res.json({
      productId,
      productName: comparison.productName,
      sources,
      totalSources: sources.length,
    });
  } catch (error) {
    console.error("Sources error:", error);
    return res.status(500).json({
      error: "SourcesError",
      message: "Failed to get product sources",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as priceHistoryRouter };
