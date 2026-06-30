import { formatTokenAmount, parseTokenAmount } from './format';

describe('formatTokenAmount', () => {
  test('formats 18-decimal wei values', () => {
    expect(formatTokenAmount('1000000000000000000', 18)).toBe('1');
    expect(formatTokenAmount('1500000000000000000', 18)).toBe('1.5');
  });

  test('formats 6-decimal token values', () => {
    expect(formatTokenAmount('1000000', 6)).toBe('1');
    expect(formatTokenAmount('2500000', 6)).toBe('2.5');
  });
});

describe('parseTokenAmount', () => {
  test('parses human-readable values to base units', () => {
    expect(parseTokenAmount('1', 18)).toBe('1000000000000000000');
    expect(parseTokenAmount('2.5', 6)).toBe('2500000');
  });
});
