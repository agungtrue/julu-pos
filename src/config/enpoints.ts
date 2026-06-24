const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

export const endpoints = {
  auth: {
    login: `${BASE_URL}/auth/login`,
    // profile: `${BASE_URL}/auth/profile`,
  },
  ingredients: {
    get: `${BASE_URL}/ingredients`,
    post: `${BASE_URL}/ingredients`,
    put: (id: string) => `${BASE_URL}/ingredients/${id}`,
    delete: (id: string) => `${BASE_URL}/ingredients/${id}`,
  },
  orders: {
    summary: {
      get: `${BASE_URL}/orders/summary`,
    },
    summaryRange: {
      get: (query: string) => `${BASE_URL}/orders/summary?${query}`,
    },
  }
};