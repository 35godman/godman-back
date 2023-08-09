export const removeLinks = (content: string): string => {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return content.replace(urlRegex, '');
};
