/**
 * Application parameters for local running.
 * No base44 or cloud service configuration needed.
 */
export const appParams = {
  fromUrl: typeof window !== 'undefined' ? window.location.href : '/'
};
