/**
 * Generates a SEO-friendly slug from a product name
 * @param name - The product name to convert to a slug
 * @returns A URL-friendly slug string
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Formats a price with proper currency symbol and formatting
 * @param price - The price in cents
 * @param currency - The currency code
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(price);
}

/**
 * Calculates the percentage change between two prices
 * @param oldPrice - The old price
 * @param newPrice - The new price
 * @returns Percentage change (positive for increase, negative for decrease)
 */
export function calculatePriceChange(
  oldPrice: number,
  newPrice: number
): number {
  if (oldPrice === 0) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
}
