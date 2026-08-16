let BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.julucoffee.com";
console.log({
  api: process.env.NEXT_PUBLIC_API_URL,
  baseUrl: BASE_URL,
  env: process.env.NODE_ENV,
});

if (process.env.NODE_ENV === "development") {
  BASE_URL = "http://julu-pos.localhost:3006";
}

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
    },
  },
  ingredientMutation: {
    get: `${BASE_URL}/ingredients/mutations`,
    restock: `${BASE_URL}/ingredients/mutations/restock`,
    loss: `${BASE_URL}/ingredients/mutations/loss`,
    summary: `${BASE_URL}/ingredients/mutations/summary`,
  },
  dashboard: {
    summary: `${BASE_URL}/dashboard/summary`,
  },
  orders: {
    summary: {
      get: `${BASE_URL}/orders/summary`,
    },
    delete: (id: string) => `${BASE_URL}/orders/${id}`,
    order: {
      init: `${BASE_URL}/orders/init`,
      confirm: `${BASE_URL}/orders/confirm`,
    },
    summaryRange: {
      get: (query: string) => `${BASE_URL}/orders/summary?${query}`,
    },
    getAll: `${BASE_URL}/orders`,
    salesReport: `${BASE_URL}/orders/sales-report`,
  },
  products: {
    getWithIngredients: `${BASE_URL}/products?withIngredients=true`,
    get: `${BASE_URL}/products`,
    post: `${BASE_URL}/products`,
    patch: (id: string) => `${BASE_URL}/products/${id}`,
  },
  users: {
    get: `${BASE_URL}/users`,
    post: `${BASE_URL}/users`,
    patch: (id: string) => `${BASE_URL}/users/${id}`,
    my: `${BASE_URL}/users/my`,
    changePassword: `${BASE_URL}/users/change-password`,
  },
  tenants: {
    get: `${BASE_URL}/tenants`,
    post: `${BASE_URL}/tenants`,
    patch: (id: string) => `${BASE_URL}/tenants/${id}`,
    status: (id: string) => `${BASE_URL}/tenants/${id}/status`,
  },
  opex: {
    get: `${BASE_URL}/opex`,
    post: `${BASE_URL}/opex`,
    patch: (id: string) => `${BASE_URL}/opex/${id}`,
    delete: (id: string) => `${BASE_URL}/opex/${id}`,
  },
  subscriptions: {
    plans: `${BASE_URL}/subscription-plans`,
    checkout: `${BASE_URL}/subscription-invoices/checkout`,
    activePending: `${BASE_URL}/subscription-invoices/active-pending`,
    invoiceDetail: (invoiceNumber: string) =>
      `${BASE_URL}/subscription-invoices/detail/${invoiceNumber}`,
    invoiceList: `${BASE_URL}/subscription-invoices/admin/invoice-list`,
    approve: (invoiceId: string) =>
      `${BASE_URL}/subscription-invoices/${invoiceId}/approve`,
    admin: {
      dashboarStats: `${BASE_URL}/subscription-invoices/admin/dashboard-stats`,
    },
  },
};
