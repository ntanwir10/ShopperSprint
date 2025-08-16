import { Product } from '../lib/api';

export interface PriceHistoryPoint {
  date: string;
  price: number;
  currency: string;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro 128GB - Natural Titanium',
    image:
      'https://images.unsplash.com/photo-1669049776943-66b1bb724670?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjBzbWFydHBob25lJTIwcHJvZHVjdHxlbnwxfHx8fHwxNzU1MjE5NTU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 999,
    originalPrice: 1199,
    currency: 'USD',
    source: 'Apple Store',
    url: 'https://apple.com',
    rating: 4.8,
    reviewCount: 2847,
    availability: 'in_stock',
    priceChange: 16.7,
    category: 'Smartphones',
    lastScraped: new Date().toISOString(),
    slug: 'iphone-15-pro-128gb-natural-titanium',
  },
  {
    id: '2',
    name: 'MacBook Pro 14-inch M3 Pro Chip with 8-Core CPU',
    image:
      'https://images.unsplash.com/photo-1629491697442-7d67fc25d897?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMG1hY2Jvb2t8ZW58MXx8fHwxNzU1MjE5NTU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 1999,
    originalPrice: 1999,
    currency: 'USD',
    source: 'Best Buy',
    url: 'https://bestbuy.com',
    rating: 4.6,
    reviewCount: 1284,
    availability: 'limited',
    priceChange: 2.5,
    category: 'Laptops',
    lastScraped: new Date().toISOString(),
    slug: 'macbook-pro-14-inch-m3-pro-chip-8-core-cpu',
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    image:
      'https://images.unsplash.com/photo-1632200004922-bc18602c79fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFkcGhvbmVzJTIwd2lyZWxlc3MlMjBhdWRpb3xlbnwxfHx8fHwxNzU1MjE5NTYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 328,
    originalPrice: 399,
    currency: 'USD',
    source: 'Amazon',
    url: 'https://amazon.com',
    rating: 4.7,
    reviewCount: 5692,
    availability: 'in_stock',
    priceChange: -17.8,
    category: 'Audio',
    lastScraped: new Date().toISOString(),
    slug: 'sony-wh-1000xm5-wireless-noise-canceling-headphones',
  },
  {
    id: '4',
    name: 'iPad Air 11-inch M2 Chip Wi-Fi 128GB',
    image:
      'https://images.unsplash.com/photo-1669049776943-66b1bb724670?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcGhvbmUlMjBzbWFydHBob25lJTIwcHJvZHVjdHxlbnwxfHx8fHwxNzU1MjE5NTU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 599,
    originalPrice: 599,
    currency: 'USD',
    source: 'Walmart',
    url: 'https://walmart.com',
    rating: 4.5,
    reviewCount: 892,
    availability: 'in_stock',
    priceChange: 0,
    category: 'Tablets',
    lastScraped: new Date().toISOString(),
    slug: 'ipad-air-11-inch-m2-chip-wi-fi-128gb',
  },
  {
    id: '5',
    name: 'Nintendo Switch OLED Model with Neon Red and Neon Blue Joy‑Con',
    image:
      'https://images.unsplash.com/photo-1629491697442-7d67fc25d897?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMG1hY2Jvb2t8ZW58MXx8fHwxNzU1MjE5NTU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 349,
    originalPrice: 349,
    currency: 'USD',
    source: 'Target',
    url: 'https://target.com',
    rating: 4.4,
    reviewCount: 3247,
    availability: 'out_of_stock',
    priceChange: 5.2,
    category: 'Gaming',
    lastScraped: new Date().toISOString(),
    slug: 'nintendo-switch-oled-model-neon-red-blue-joy-con',
  },
  {
    id: '6',
    name: 'Nike Air Max 270 Running Shoes',
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXN8ZW58MXx8fHwxNzU1MjE5NTU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 150,
    originalPrice: 180,
    currency: 'USD',
    source: 'Nike Store',
    url: 'https://nike.com',
    rating: 4.6,
    reviewCount: 2156,
    availability: 'in_stock',
    priceChange: -16.7,
    category: 'Sports & Fitness',
    lastScraped: new Date().toISOString(),
    slug: 'nike-air-max-270-running-shoes',
  },
  {
    id: '7',
    name: 'Adidas Ultraboost 22 Running Shoes',
    image:
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXN8ZW58MXx8fHwxNzU1MjE5NTU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 190,
    originalPrice: 220,
    currency: 'USD',
    source: 'Adidas Store',
    url: 'https://adidas.com',
    rating: 4.7,
    reviewCount: 1893,
    availability: 'in_stock',
    priceChange: -13.6,
    category: 'Sports & Fitness',
    lastScraped: new Date().toISOString(),
    slug: 'adidas-ultraboost-22-running-shoes',
  },
  {
    id: '8',
    name: 'Wilson Pro Staff Tennis Racket',
    image:
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW5uaXMlMjByYWNrZXR8ZW58MXx8fHwxNzU1MjE5NTU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 89,
    originalPrice: 120,
    currency: 'USD',
    source: "Dick's Sporting Goods",
    url: 'https://dickssportinggoods.com',
    rating: 4.5,
    reviewCount: 567,
    availability: 'in_stock',
    priceChange: -25.8,
    category: 'Sports & Fitness',
    lastScraped: new Date().toISOString(),
    slug: 'wilson-pro-staff-tennis-racket',
  },
  {
    id: '9',
    name: 'Under Armour Tech 2.0 T-Shirt',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMgdC1zaGlydHxlbnwxfHx8fHwxNzU1MjE5NTU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 35,
    originalPrice: 45,
    currency: 'USD',
    source: 'Under Armour Store',
    url: 'https://underarmour.com',
    rating: 4.3,
    reviewCount: 892,
    availability: 'in_stock',
    priceChange: -22.2,
    category: 'Sports & Fitness',
    lastScraped: new Date().toISOString(),
    slug: 'under-armour-tech-2-0-t-shirt',
  },
];

export const mockPriceHistory: Record<string, PriceHistoryPoint[]> = {
  '1': [
    { date: '2024-01-01', price: 1199, currency: 'USD' },
    { date: '2024-01-08', price: 1099, currency: 'USD' },
    { date: '2024-01-15', price: 999, currency: 'USD' },
    { date: '2024-01-22', price: 999, currency: 'USD' },
  ],
  '2': [
    { date: '2024-01-01', price: 1999, currency: 'USD' },
    { date: '2024-01-08', price: 1999, currency: 'USD' },
    { date: '2024-01-15', price: 1999, currency: 'USD' },
    { date: '2024-01-22', price: 1999, currency: 'USD' },
  ],
  '3': [
    { date: '2024-01-01', price: 399, currency: 'USD' },
    { date: '2024-01-08', price: 359, currency: 'USD' },
    { date: '2024-01-15', price: 328, currency: 'USD' },
    { date: '2024-01-22', price: 328, currency: 'USD' },
  ],
  '4': [
    { date: '2024-01-01', price: 599, currency: 'USD' },
    { date: '2024-01-08', price: 599, currency: 'USD' },
    { date: '2024-01-15', price: 599, currency: 'USD' },
    { date: '2024-01-22', price: 599, currency: 'USD' },
  ],
  '5': [
    { date: '2024-01-01', price: 349, currency: 'USD' },
    { date: '2024-01-08', price: 349, currency: 'USD' },
    { date: '2024-01-15', price: 349, currency: 'USD' },
    { date: '2024-01-22', price: 349, currency: 'USD' },
  ],
};

export const generatePriceHistory = (
  currentPrice: number
): PriceHistoryPoint[] => {
  const basePrice = currentPrice * 0.8;
  const days = 30;
  const history: PriceHistoryPoint[] = [];

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const randomVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
    const price = basePrice * (1 + randomVariation);

    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
      currency: 'USD',
    });
  }

  return history;
};
