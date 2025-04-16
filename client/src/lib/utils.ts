import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price with Indian Rupee symbol
export function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}

// Format date to locale string
export function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

// Format date to relative time (e.g., "2 hours ago")
export function formatRelativeTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(d);
  }
}

// Generate a random order ID
export function generateOrderId() {
  return `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
}

// Calculate commission (5%)
export function calculateCommission(amount: number) {
  return amount * 0.05;
}

// Format percentage for display
export function formatPercentage(value: number) {
  return `${value.toFixed(0)}%`;
}

// Calculate percentage
export function calculatePercentage(value: number, total: number) {
  return (value / total) * 100;
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem('user');
}

// Get current user from local storage
export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Check if user is a farmer
export function isFarmer(user: any) {
  return user?.userType === 'farmer';
}

// Check if user is a vendor
export function isVendor(user: any) {
  return user?.userType === 'vendor';
}
