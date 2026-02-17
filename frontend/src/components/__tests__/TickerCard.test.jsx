import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TickerCard from '../TickerCard';

describe('TickerCard', () => {
  const stock = {
    symbol: 'RELIANCE.NS',
    current_price: 2500.50,
    previous_close: 2450.0,
    change: 50.50,
    percent_change: 2.06,
  };

  it('renders stock symbol without .NS suffix', () => {
    render(<TickerCard stock={stock} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText('RELIANCE')).toBeInTheDocument();
  });

  it('shows positive change in green', () => {
    render(<TickerCard stock={stock} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText('+50.50')).toBeInTheDocument();
  });

  it('shows selected state', () => {
    const { container } = render(<TickerCard stock={stock} isSelected={true} onClick={() => {}} />);
    expect(container.firstChild).toHaveClass('bg-blue-500/10');
  });

  it('shows negative change', () => {
    const negStock = { ...stock, change: -30, percent_change: -1.2 };
    render(<TickerCard stock={negStock} isSelected={false} onClick={() => {}} />);
    expect(screen.getByText('-30.00')).toBeInTheDocument();
  });
});
