export const normalizeUrl = (url: string): string => {
  // Remove trailing slash
  return url.replace(/\/$/, '');
};
