import { PartialDate } from './models';

/**
 * Format partial date for display
 */
export function formatPartialDate(d?: PartialDate): string {
  if (!d) return '';
  
  if (d.range?.from || d.range?.to) {
    const from = d.range?.from ?? '?';
    const to = d.range?.to ?? '?';
    return `${from}–${to}${d.approximate ? ' (approx)' : ''}`;
  }
  
  const { year, month, day } = d;
  if (year && month && day) {
    const formatter = new Intl.DateTimeFormat('en-IN', { day: "2-digit", month: 'short' });
    return `${formatter.format(new Date(year, month - 1, day))} ${year}${d.approximate ? ' (approx)' : ''}`;
  }
  if (month && year) {
    return `${month}/${year}${d.approximate ? ' (approx)' : ''}`;
  }
  if (year) {
    return `${year}${d.approximate ? ' (approx)' : ''}`;
  }
  
  return d.notes ?? '';
}

/**
 * Format date for compact display (for tree nodes)
 */
export function formatCompactDate(d?: PartialDate): string {
  if (!d) return '';
  
  if (d.range?.from || d.range?.to) {
    const from = d.range?.from ?? '?';
    const to = d.range?.to ?? '?';
    return `${from}–${to}`;
  }
  
  const { year, month, day } = d;
  if (year && month && day) {
    return `${day} ${getMonthAbbrev(month)} ${year}`;
  }
  if (month && year) {
    return `${getMonthAbbrev(month)} ${year}`;
  }
  if (year) {
    return `${year}`;
  }
  
  return '';
}

/**
 * Get month abbreviation
 */
export function getMonthAbbrev(month: number): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[month - 1] || '';
}

/**
 * Calculate age from birth date
 */
export function calculateAge(dob?: PartialDate, deathDate?: PartialDate): number | null {
  if (!dob?.year) return null;
  
  const currentYear = new Date().getFullYear();
  const endYear = deathDate?.year || currentYear;
  
  return endYear - dob.year;
}

/**
 * Generate a compact name display for tree nodes
 */
export function formatCompactName(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length <= 2) return name;
  
  // Return first name + last name for long names
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

/**
 * Generate life span string (birth - death)
 */
export function formatLifeSpan(dob?: PartialDate, deathDate?: PartialDate): string {
  const birth = formatCompactDate(dob);
  const death = formatCompactDate(deathDate);
  
  if (birth && death) {
    return `${birth} - ${death}`;
  }
  if (birth) {
    return `${birth}`;
  }
  if (death) {
    return `? - ${death}`;
  }
  
  return '';
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Sanitize string for display (prevent XSS)
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 3);
}

/**
 * Deep clone object (for state management)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate a slug from a name (for URLs or IDs)
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if format not recognized
}

/**
 * Check if a person is living based on death date
 */
export function isPersonLiving(deathDate?: PartialDate): boolean {
  return !deathDate || (!deathDate.year && !deathDate.range);
}

/**
 * Convert legacy data format to new format (for migration)
 */
export function convertLegacyPerson(legacyPerson: Record<string, unknown>): Record<string, unknown> {
  return {
    ...legacyPerson,
    isLiving: isPersonLiving(legacyPerson.deathDate as PartialDate | undefined),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Generate a unique ID (fallback for client-side operations)
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
