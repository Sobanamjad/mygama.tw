const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ========== AUTH ==========
export const authApi = {
  login: async (username: string, password: string) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (data.success && data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  getUser: () => {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },
};

// ========== MENUS ==========
export const menuApi = {
  getMenus: async () => {
    const data = await apiCall('/menus');
    return data.menus;
  },

  updateMenu: async (name: string, items: any[]) => {
    return apiCall(`/menus/${name}`, {
      method: 'PUT',
      body: JSON.stringify({ name, items }),
    });
  },

  addMenuItem: async (name: string, item: any) => {
    return apiCall('/menus/item', {
      method: 'POST',
      body: JSON.stringify({ name, ...item }),
    });
  },

  deleteMenuItem: async (id: string) => {
    return apiCall(`/menus/item/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========== CONTENT ==========
export const contentApi = {
  getContent: async () => {
    const data = await apiCall('/content');
    return data.content;
  },

  updateContent: async (sectionId: string, content: Record<string, string>) => {
    return apiCall(`/content/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify({ section_id: sectionId, content }),
    });
  },
};

// ========== RSS ==========
export const rssApi = {
  getFeeds: async () => {
    const data = await apiCall('/rss');
    return data.feeds;
  },

  addFeed: async (feed: any) => {
    return apiCall('/rss', {
      method: 'POST',
      body: JSON.stringify(feed),
    });
  },

  updateFeed: async (id: string, data: any) => {
    return apiCall(`/rss/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteFeed: async (id: string) => {
    return apiCall(`/rss/${id}`, {
      method: 'DELETE',
    });
  },

  toggleFeed: async (id: string) => {
    return apiCall(`/rss/${id}/toggle`, {
      method: 'PATCH',
    });
  },
};

// ========== PAGES ==========
export const pageApi = {
  getPages: async () => {
    const data = await apiCall('/pages');
    return data.pages;
  },

  getPage: async (slug: string) => {
    const data = await apiCall(`/pages/${slug}`);
    return data.page;
  },

  createPage: async (page: any) => {
    return apiCall('/pages', {
      method: 'POST',
      body: JSON.stringify(page),
    });
  },

  updatePage: async (id: string, data: any) => {
    return apiCall(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePage: async (id: string) => {
    return apiCall(`/pages/${id}`, {
      method: 'DELETE',
    });
  },

  togglePublish: async (id: string) => {
    return apiCall(`/pages/${id}/toggle`, {
      method: 'PATCH',
    });
  },
};

// ========== MEDIA ==========
export const mediaApi = {
  getMedia: async () => {
    const data = await apiCall('/media');
    return data.media;
  },

  uploadMedia: async (file: File) => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  deleteMedia: async (id: string) => {
    return apiCall(`/media/${id}`, {
      method: 'DELETE',
    });
  },
};
