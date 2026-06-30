export function truncateAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTokenAmount(value, decimals = 18, maxFractionDigits = 4) {
  if (value === undefined || value === null || value === '') return '0';
  try {
    const raw = BigInt(value);
    const divisor = 10n ** BigInt(decimals);
    const whole = raw / divisor;
    const fraction = raw % divisor;
    if (fraction === 0n) return whole.toString();
    const fractionStr = fraction.toString().padStart(Number(decimals), '0').slice(0, maxFractionDigits);
    return `${whole}.${fractionStr}`.replace(/\.?0+$/, '');
  } catch {
    return '0';
  }
}

export function parseTokenAmount(value, decimals = 18) {
  if (!value || Number(value) <= 0) return '0';
  const [whole, fraction = ''] = value.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return `${whole}${paddedFraction}`.replace(/^0+/, '') || '0';
}

export function formatCountdown(days, hours, minutes, seconds) {
  const parts = [];
  if (Number(days) > 0) parts.push(`${days}d`);
  if (Number(hours) > 0) parts.push(`${hours}h`);
  if (Number(minutes) > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

export function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
