/**
 * Format a date object to a readable string format
 * 
 * @param date Date object to format
 * @returns Formatted date string (e.g., "May 21, 2025")
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a date object to a shorter format
 * 
 * @param date Date object to format
 * @returns Short formatted date string (e.g., "21/05/2025")
 */
export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Format a date with time
 * 
 * @param date Date object to format
 * @returns Formatted date with time (e.g., "May 21, 2025, 5:30 PM")
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

/**
 * Get a relative time string (e.g., "2 days ago")
 * 
 * @param date Date to compare against current time
 * @returns Relative time string
 */
export function getRelativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(diffInDays, 'day');
  } else if (Math.abs(diffInDays) < 365) {
    return rtf.format(Math.floor(diffInDays / 30), 'month');
  } else {
    return rtf.format(Math.floor(diffInDays / 365), 'year');
  }
}
