/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format weight in kg
 */
export function formatWeight(weightKg: number): string {
  if (weightKg < 1) {
    return `${(weightKg * 1000).toFixed(0)} g`;
  }
  return `${weightKg.toFixed(1)} kg`;
}

/**
 * Format phone number for display (Indian format)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format time for display
 */
export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format relative time (e.g., "5 min ago", "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateString);
}

/**
 * Format distance
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${(distanceKm * 1000).toFixed(0)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Format ETA
 */
export function formatETA(minutes: number): string {
  if (minutes < 1) return 'Arriving now';
  if (minutes < 60) return `${Math.ceil(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = Math.ceil(minutes % 60);
  return `${hours}h ${remainingMin}m`;
}

/**
 * Mask Aadhaar number (show last 4 digits only)
 */
export function maskAadhaar(aadhaar: string): string {
  const cleaned = aadhaar.replace(/\D/g, '');
  if (cleaned.length !== 12) return '****-****-****';
  return `****-****-${cleaned.slice(8)}`;
}

/**
 * Format rating
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Format booking status for display
 */
export function formatBookingStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    assigned: 'Assigned',
    accepted: 'Accepted',
    en_route: 'On the way',
    arrived: 'Arrived',
    weighing: 'Weighing',
    payment_pending: 'Payment pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No show',
  };
  return statusMap[status] || status;
}
