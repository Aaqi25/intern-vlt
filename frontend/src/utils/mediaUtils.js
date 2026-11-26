/**
 * Resolves media URLs properly between Vite dev server and backend Express API server.
 */
export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_URL || '/api';
  const serverBase = apiBase === '/api' ? '' : apiBase.replace(/\/api\/?$/, '');
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${serverBase}${normalizedPath}`;
};

export default getMediaUrl;
