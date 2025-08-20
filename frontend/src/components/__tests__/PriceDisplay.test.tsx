import { render, screen } from '@testing-library/react';
import PriceDisplay from '../PriceDisplay';

// Mock product data for testing
const createMockProduct = (price: number, currency: string) => ({
  id: '1',
  name: 'Test Product',
  price,
  currency,
  availability: 'in_stock' as const,
  source: 'Test Store',
  url: 'https://test.com',
  lastScraped: new Date().toISOString(),
});

describe('PriceDisplay', () => {
  it('renders price in USD format', () => {
    const product = createMockProduct(1000, 'USD');
    render(<PriceDisplay product={product} />);
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('renders price of 0 correctly', () => {
    const product = createMockProduct(0, 'USD');
    render(<PriceDisplay product={product} />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('renders large price correctly', () => {
    const product = createMockProduct(999999, 'USD');
    render(<PriceDisplay product={product} />);
    expect(screen.getByText('$999,999.00')).toBeInTheDocument();
  });

  it('renders price with cents correctly', () => {
    const product = createMockProduct(1050, 'USD');
    render(<PriceDisplay product={product} />);
    expect(screen.getByText('$10.50')).toBeInTheDocument();
  });

  it('renders price with different currency', () => {
    const product = createMockProduct(1000, 'EUR');
    render(<PriceDisplay product={product} />);
    expect(screen.getByText('€10.00')).toBeInTheDocument();
  });

  it('renders price with GBP currency', () => {
    const product = createMockProduct(1000, 'GBP');
    render(<PriceDisplay product={product} />);
    expect(screen.getByText('£10.00')).toBeInTheDocument();
  });

  it('renders price with empty currency (defaults to USD)', () => {
    const product = createMockProduct(1000, '');
    render(<PriceDisplay product={product} />);
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('renders price with undefined currency (defaults to USD)', () => {
    const product = createMockProduct(1000, undefined as any);
    render(<PriceDisplay product={product} />);
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const product = createMockProduct(1000, 'USD');
    render(
      <PriceDisplay product={product} className="text-2xl text-blue-600" />
    );
    const priceElement = screen.getByText('$10.00');
    expect(priceElement).toHaveClass('text-2xl', 'text-blue-600');
  });

  it('renders with undefined className', () => {
    const product = createMockProduct(1000, 'USD');
    render(<PriceDisplay product={product} className={undefined} />);
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('renders negative price correctly', () => {
    const product = createMockProduct(-1000, 'USD');
    render(<PriceDisplay product={product} />);
    expect(screen.getByText('-$10.00')).toBeInTheDocument();
  });

  it('renders small price correctly', () => {
    const product = createMockProduct(1, 'USD');
    render(<PriceDisplay product={product} />);
    expect(screen.getByText('$0.01')).toBeInTheDocument();
  });

  it('renders price with odd cents correctly', () => {
    const product = createMockProduct(1001, 'USD');
    render(<PriceDisplay product={product} />);
    expect(screen.getByText('$10.01')).toBeInTheDocument();
  });
});
