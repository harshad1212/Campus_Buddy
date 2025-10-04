/**
 * time utilities
 * - formatRelativeTime(Date | timestamp) -> "2m ago" or "Today 3:24 PM" depending on recency
 * - formatAbsolute(Date) -> locale string
 */

export function formatRelativeTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000); // seconds
  if (diff < 10) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (now.toDateString() === d.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString();
}

export function formatAbsolute(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString();
}
