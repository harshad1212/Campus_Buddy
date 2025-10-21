/**
 * time utilities
 * - formatRelativeTime(Date | timestamp) -> "2m ago" or "Today 3:24 PM" depending on recency
 * - formatAbsolute(Date) -> locale string
 */

export const formatMessageTime = (date) => {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return timeString;
  if (isYesterday) return `Yesterday, ${timeString}`;
  return (
    date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    }) + `, ${timeString}`
  );
};

export function formatAbsolute(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString();
}
