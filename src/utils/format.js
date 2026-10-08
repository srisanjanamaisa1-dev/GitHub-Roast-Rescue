export const ago = (date) => {
  if (!date) return "unknown";
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d < 1) return "today";
  if (d === 1) return "1 day ago";
  if (d < 30) return `${d} days ago`;
  if (d < 365) return `${Math.floor(d/30)} months ago`;
  return `${Math.floor(d/365)} years ago`;
};
export const pct = (n,d) => d ? Math.round((n/d)*100) : 0;
export const clamp = (n,min,max) => Math.min(max, Math.max(min,n));
