const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.julucoffee.com';
console.log({ env: process.env.NEXT_PUBLIC_API_URL, baseUrl: BASE_URL })
export const endpoints = {
  auth: {
    login: `${BASE_URL}/auth/login`,
    // profile: `${BASE_URL}/auth/profile`,
  },
  ingredients: {
    get: `${BASE_URL}/ingredients`,
    post: `${BASE_URL}/ingredients`,
    patch: (id: string) => `${BASE_URL}/ingredients/${id}`,
    delete: (id: string) => `${BASE_URL}/ingredients/${id}`,
    recipe: {
        get: (id: string) => `${BASE_URL}/ingredients/recipe/${id}`,
        post: `${BASE_URL}/ingredients/recipe`,
    }
  },
  orders: {
    summary: {
      get: `${BASE_URL}/orders/summary`,
    },
    summaryRange: {
      get: (query: string) => `${BASE_URL}/orders/summary?${query}`,
    },
    getAll: `${BASE_URL}/orders`,
  },
  products: {
    getWithIngredients: `${BASE_URL}/products?withIngredients=true`,
    get: `${BASE_URL}/products`,
    post: `${BASE_URL}/products`,
  }
};