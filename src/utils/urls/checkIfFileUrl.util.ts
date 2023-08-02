export const checkIfFileUrlUtil = (url) => {
  url = new URL(url);
  return url.pathname.split('/').pop().indexOf('.') > 0;
};
