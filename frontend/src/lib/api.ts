const API_URL = process.env.NEXT_PUBLIC_API_URL || 'postgres-production-11e4.up.railway.app';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

export const api = {
  auth: {
    registerBuyer: (body: Record<string, string>) =>
      request<{ user: unknown; token: string }>('/auth/register/buyer', { method: 'POST', body: JSON.stringify(body) }),
    registerSeller: (body: Record<string, unknown>) =>
      request<{ user: unknown; token: string }>('/auth/register/seller', { method: 'POST', body: JSON.stringify(body) }),
    login: (email: string, password: string) =>
      request<{ user: unknown; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    forgotPassword: (email: string) =>
      request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    me: () => request('/auth/me'),
  },
  products: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/products${qs}`);
    },
    featured: () => request('/products/featured'),
    get: (id: string) => request(`/products/${id}`),
    create: (body: Record<string, unknown>) =>
      request('/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Record<string, unknown>) =>
      request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request(`/products/${id}`, { method: 'DELETE' }),
    mine: () => request('/products/seller/mine'),
  },
  transactions: {
    initiate: (productId: string) =>
      request<{ transactionId: string; authorizationUrl: string; reference: string }>(
        '/transactions/initiate',
        { method: 'POST', body: JSON.stringify({ productId }) }
      ),
    verify: (reference: string) =>
      request('/transactions/verify', { method: 'POST', body: JSON.stringify({ reference }) }),
    deliver: (id: string) => request(`/transactions/${id}/deliver`, { method: 'PATCH' }),
    confirm: (id: string) => request(`/transactions/${id}/confirm`, { method: 'PATCH' }),
    myPurchases: () => request('/transactions/my-purchases'),
    mySales: () => request('/transactions/my-sales'),
    get: (id: string) => request(`/transactions/${id}`),
  },
  wallet: {
    get: () => request('/wallet'),
    withdraw: (amount: number, bankDetails: Record<string, string>) =>
      request('/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount, bankDetails }) }),
  },
  disputes: {
    create: (body: Record<string, unknown>) =>
      request('/disputes', { method: 'POST', body: JSON.stringify(body) }),
    mine: () => request('/disputes/my'),
  },
  notifications: {
    list: () => request('/notifications'),
    markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  },
  admin: {
    analytics: () => request('/admin/analytics'),
    users: (role?: string) => request(`/admin/users${role ? `?role=${role}` : ''}`),
    suspendUser: (id: string, suspend: boolean) =>
      request(`/admin/users/${id}/suspend`, { method: 'PATCH', body: JSON.stringify({ suspend }) }),
    pendingSellers: () => request('/admin/sellers/pending'),
    reviewSeller: (id: string, approved: boolean, rejectionReason?: string) =>
      request(`/admin/sellers/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ approved, rejectionReason }),
      }),
    products: () => request('/admin/products'),
    removeProduct: (id: string) => request(`/admin/products/${id}`, { method: 'DELETE' }),
    transactions: () => request('/admin/transactions'),
    disputes: () => request('/admin/disputes'),
    resolveDispute: (id: string, action: string, resolution: string) =>
      request(`/admin/disputes/${id}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ action, resolution }),
      }),
  },
};
