import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * Get the user's local timezone
 * @returns The user's timezone string (e.g., 'America/New_York')
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Format a date string to a readable format in the user's local timezone
 * @param dateString - ISO date string
 * @param formatString - Format string for date-fns
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | undefined, 
  formatString: string = 'MMM dd, yyyy h:mm a'
): string => {
  if (!dateString) return 'N/A';
  
  try {
    // Get the user's timezone
    const userTimeZone = getUserTimezone();
    
    // Parse the ISO date string
    const date = parseISO(dateString);
    
    // Format the date in the user's local timezone
    const formattedDate = formatInTimeZone(date, userTimeZone, formatString);
    
    return formattedDate;
  } catch (error) {
    console.error('Error formatting date:', error, 'for date string:', dateString);
    return 'Invalid date';
  }
};

/**
 * Format a date string to show only the date and time in a more compact format
 * @param dateString - ISO date string
 * @returns Formatted time string
 */
export const formatTimeOnly = (
  dateString: string | undefined
): string => {
  if (!dateString) return 'N/A';
  
  try {
    // Get the user's timezone
    const userTimeZone = getUserTimezone();
    
    // Parse the ISO date string
    const date = parseISO(dateString);
    
    // Format the date in the user's local timezone
    // Use a more compact format for the table display
    const formattedDate = formatInTimeZone(date, userTimeZone, 'MM/dd h:mm a');
    
    return formattedDate;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date for API requests
 * @param date - Date object
 * @returns ISO date string formatted for API
 */
export const formatDateForApi = (date: Date | null): string | undefined => {
  if (!date) return undefined;
  return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
};

/**
 * Get the severity level color
 * @param severity - Severity string from alert
 * @returns Color string for Material UI
 */
export const getSeverityColor = (severity: string): 'error' | 'warning' | 'info' | 'success' | 'default' => {
  switch (severity.toLowerCase()) {
    case 'extreme':
      return 'error';
    case 'severe':
      return 'error';
    case 'moderate':
      return 'warning';
    case 'minor':
      return 'info';
    case 'unknown':
    default:
      return 'default';
  }
};
