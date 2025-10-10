/**
 * Utility functions for business hours calculations
 */

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

/**
 * Check if a business is currently open based on business hours
 * @param businessHours - The business hours object
 * @param timezone - Optional timezone (defaults to 'Africa/Nairobi')
 * @returns boolean indicating if business is open
 */
export function isBusinessCurrentlyOpen(
  businessHours: BusinessHours, 
  timezone: string = 'Africa/Nairobi'
): boolean {
  if (!businessHours) return false;

  // Get current time in specified timezone
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { 
    weekday: 'long',
    timeZone: timezone 
  }).toLowerCase();

  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone
  });

  // Get today's business hours
  const todayHours = businessHours[currentDay];
  
  if (!todayHours || todayHours.closed) {
    return false;
  }

  // Check if current time is within business hours
  const { open, close } = todayHours;
  
  if (!open || !close) {
    return false;
  }

  // Convert times to comparable format (24-hour format)
  const normalizeTime = (time: string): string => {
    // Handle various time formats
    if (time.includes('AM') || time.includes('PM')) {
      // Convert 12-hour to 24-hour format
      const [timePart, period] = time.split(/\s+/);
      const [hours, minutes] = timePart.split(':');
      let hour24 = parseInt(hours);
      
      if (period.toUpperCase() === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      return `${hour24.toString().padStart(2, '0')}:${minutes || '00'}`;
    }
    
    // Already in 24-hour format, ensure proper formatting
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes || '00'}`;
  };

  const normalizedOpen = normalizeTime(open);
  const normalizedClose = normalizeTime(close);
  const normalizedCurrent = currentTime;

  console.log(`Business Hours Check for ${currentDay}:`, {
    currentTime: normalizedCurrent,
    openTime: normalizedOpen,
    closeTime: normalizedClose,
    isOpen: normalizedCurrent >= normalizedOpen && normalizedCurrent <= normalizedClose
  });

  // Handle overnight hours (e.g., 22:00 - 06:00)
  if (normalizedClose < normalizedOpen) {
    return normalizedCurrent >= normalizedOpen || normalizedCurrent <= normalizedClose;
  }

  // Normal hours (e.g., 09:00 - 17:00)
  return normalizedCurrent >= normalizedOpen && normalizedCurrent <= normalizedClose;
}

/**
 * Get formatted business hours string for display
 * @param businessHours - The business hours object
 * @returns formatted business hours object for display
 */
export function formatBusinessHours(businessHours: BusinessHours): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  Object.entries(businessHours).forEach(([day, hours]) => {
    if (hours.closed) {
      formatted[day] = 'Closed';
    } else {
      const formatTime = (time: string): string => {
        if (time.includes('AM') || time.includes('PM')) {
          return time;
        }
        
        // Convert 24-hour to 12-hour format for display
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        
        return `${displayHour}:${minutes} ${ampm}`;
      };

      formatted[day] = `${formatTime(hours.open)} - ${formatTime(hours.close)}`;
    }
  });

  return formatted;
}

/**
 * Get the next opening time for a business
 * @param businessHours - The business hours object
 * @param timezone - Optional timezone (defaults to 'Africa/Nairobi')
 * @returns string describing when business opens next
 */
export function getNextOpeningTime(
  businessHours: BusinessHours,
  timezone: string = 'Africa/Nairobi'
): string {
  if (!businessHours) return 'Hours not available';

  const now = new Date();
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  // Check today first
  const currentDay = now.toLocaleDateString('en-US', { 
    weekday: 'long',
    timeZone: timezone 
  }).toLowerCase();
  
  const todayHours = businessHours[currentDay];
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone
  });

  // If open today and haven't closed yet
  if (todayHours && !todayHours.closed && todayHours.open) {
    const normalizeTime = (time: string): string => {
      if (time.includes('AM') || time.includes('PM')) {
        const [timePart, period] = time.split(/\s+/);
        const [hours, minutes] = timePart.split(':');
        let hour24 = parseInt(hours);
        
        if (period.toUpperCase() === 'PM' && hour24 !== 12) {
          hour24 += 12;
        } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
          hour24 = 0;
        }
        
        return `${hour24.toString().padStart(2, '0')}:${minutes || '00'}`;
      }
      
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes || '00'}`;
    };

    if (currentTime < normalizeTime(todayHours.open)) {
      const formatTime = (time: string): string => {
        if (time.includes('AM') || time.includes('PM')) return time;
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
      };

      return `Opens today at ${formatTime(todayHours.open)}`;
    }
  }

  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + i);
    
    const nextDay = nextDate.toLocaleDateString('en-US', { 
      weekday: 'long',
      timeZone: timezone 
    }).toLowerCase();
    
    const nextDayHours = businessHours[nextDay];
    
    if (nextDayHours && !nextDayHours.closed && nextDayHours.open) {
      const formatTime = (time: string): string => {
        if (time.includes('AM') || time.includes('PM')) return time;
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
      };

      const dayName = i === 1 ? 'tomorrow' : nextDay;
      return `Opens ${dayName} at ${formatTime(nextDayHours.open)}`;
    }
  }

  return 'Opening hours not available';
}