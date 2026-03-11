/**
 * Format a number as Indian Rupees (₹).
 * Examples: formatINR(299) → "₹299.00", formatINR(1599) → "₹1,599.00"
 */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
