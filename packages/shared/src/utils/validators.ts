/**
 * Validate Indian phone number
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // 10-digit Indian mobile number
  if (cleaned.length === 10) {
    return /^[6-9]\d{9}$/.test(cleaned);
  }
  // With country code
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return /^91[6-9]\d{9}$/.test(cleaned);
  }
  return false;
}

/**
 * Validate Indian pincode
 */
export function isValidPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode);
}

/**
 * Validate Aadhaar number (basic format check)
 */
export function isValidAadhaar(aadhaar: string): boolean {
  const cleaned = aadhaar.replace(/\D/g, '');
  // 12-digit number, first digit cannot be 0 or 1
  return /^[2-9]\d{11}$/.test(cleaned);
}

/**
 * Validate weight input
 */
export function isValidWeight(weight: number): boolean {
  return weight > 0 && weight <= 1000; // Max 1000 kg per item
}

/**
 * Validate booking date (must be in future, within 7 days)
 */
export function isValidBookingDate(date: string, minAdvanceHours: number = 2, maxAdvanceDays: number = 7): boolean {
  const bookingDate = new Date(date);
  const now = new Date();
  const minDate = new Date(now.getTime() + minAdvanceHours * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() + maxAdvanceDays * 24 * 60 * 60 * 1000);

  return bookingDate >= minDate && bookingDate <= maxDate;
}

/**
 * Validate name
 */
export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}

/**
 * Validate address
 */
export function isValidAddress(address: string): boolean {
  return address.trim().length >= 10 && address.trim().length <= 500;
}

/**
 * Validate rating
 */
export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

/**
 * Validate latitude
 */
export function isValidLatitude(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

/**
 * Validate longitude
 */
export function isValidLongitude(lng: number): boolean {
  return lng >= -180 && lng <= 180;
}

/**
 * Validate coordinates are in India (approximate bounds)
 */
export function isInIndia(lat: number, lng: number): boolean {
  return lat >= 6.5 && lat <= 35.5 && lng >= 68.0 && lng <= 97.5;
}
