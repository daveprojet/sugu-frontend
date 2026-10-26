export function normalizeCoord(value, precision = 8) {
  if (value == null || Number.isNaN(Number(value))) return value
  return Number(Number(value).toFixed(precision))
}
