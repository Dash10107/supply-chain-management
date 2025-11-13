/**
 * Safely formats a number or string to currency format
 */
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num && !isNaN(num) ? `$${num.toFixed(2)}` : 'N/A';
};

/**
 * Safely formats a number or string to a fixed decimal places
 */
export const formatNumber = (value: number | string | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined) return 'N/A';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num && !isNaN(num) ? num.toFixed(decimals) : 'N/A';
};

