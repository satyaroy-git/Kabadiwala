import { PLATFORM_CONFIG } from '../constants/config';

/**
 * Calculate total amount for a set of items
 */
export function calculateTotalAmount(
  items: { weight_kg: number; rate_per_kg: number }[]
): number {
  return items.reduce((total, item) => total + item.weight_kg * item.rate_per_kg, 0);
}

/**
 * Calculate platform commission
 */
export function calculateCommission(totalAmount: number): number {
  const commission = (totalAmount * PLATFORM_CONFIG.COMMISSION_PERCENTAGE) / 100;
  return Math.max(commission, PLATFORM_CONFIG.MIN_COMMISSION_AMOUNT);
}

/**
 * Calculate kabadiwala payout (total - commission)
 */
export function calculateKabadiwalaPayout(totalAmount: number): number {
  return totalAmount - calculateCommission(totalAmount);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate ETA based on distance (assuming average speed in Indian cities)
 */
export function estimateETA(distanceKm: number, vehicleType: string): number {
  // Average speeds in km/h for Indian urban areas
  const speeds: Record<string, number> = {
    bicycle: 10,
    cart: 5,
    auto_rickshaw: 20,
    mini_truck: 25,
    truck: 20,
  };
  const speed = speeds[vehicleType] || 15;
  return (distanceKm / speed) * 60; // Return minutes
}

/**
 * Calculate rate change percentage
 */
export function calculateRateChange(currentRate: number, previousRate: number): number {
  if (previousRate === 0) return 0;
  return ((currentRate - previousRate) / previousRate) * 100;
}

/**
 * Sort kabadiwalas by matching score
 * Score = (1/distance) * availabilityWeight * ratingWeight
 */
export function calculateMatchingScore(
  distanceKm: number,
  rating: number,
  totalPickups: number,
  isOnline: boolean
): number {
  if (!isOnline || distanceKm > PLATFORM_CONFIG.MAX_MATCHING_RADIUS_KM) return 0;

  const distanceScore = 1 / (distanceKm + 0.1); // Avoid division by zero
  const ratingScore = rating / 5; // Normalize to 0-1
  const experienceScore = Math.min(totalPickups / 100, 1); // Cap at 100 pickups

  // Weighted combination
  return distanceScore * 0.5 + ratingScore * 0.3 + experienceScore * 0.2;
}

/**
 * Check if kabadiwala is within service area
 */
export function isWithinServiceArea(
  kabadiwalaPincodes: string[],
  householdPincode: string
): boolean {
  return kabadiwalaPincodes.includes(householdPincode);
}

/**
 * Generate receipt number
 */
export function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KBD-${timestamp}-${random}`;
}
