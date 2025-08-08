const API_CONFIG = {
  development: 'http://localhost:3000',
  production: 'https://your-production-api.com',
  test: 'http://localhost:3001'
};

const getApiBaseUrl = (): string => {
  // You can determine environment by hostname or other means
  if (window.location.hostname === 'localhost') {
    return API_CONFIG.development;
  }
  return API_CONFIG.production;
};

export const API_BASE_URL = getApiBaseUrl();