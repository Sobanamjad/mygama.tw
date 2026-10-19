// Admin service with API integration
import { authApi, menuApi, contentApi, rssApi, pageApi, mediaApi } from './apiService';

// Check if API is available
const USE_API = import.meta.env.VITE_USE_API === 'true';

// ---------- AUTH ----------
export const adminAuth = {
  login: async (username: string, password: string) => {
    if (USE_API) {
      return authApi.login(username, password);
    }

    // Fallback to localStorage
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = btoa(`${username}:${Date.now()}`);
      localStorage.setItem('ruixin_admin', token);
      return { success: true, token };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  logout: () => {
    if (USE_API) {
      authApi.logout();
    } else {
      localStorage.removeItem('ruixin_admin');
    }
  },

  isAuthenticated: () => {
    if (USE_API) {
      return authApi.isAuthenticated();
    }
    return !!localStorage.getItem('ruixin_admin');
  }
};

// ---------- MENUS ----------
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  order: number;
  children?: MenuItem[];
}

export interface Menu {
  id: string;
  name: 'header' | 'footer';
  items: MenuItem[];
}

const defaultMenus: Menu[] = [
  {
    id: 'header',
    name: 'header',
    items: [
      { id: 'home', label: '首頁', href: '/#home', order: 0 },
      { id: 'about', label: '關於瑞信', href: '/#about', order: 1 },
      { id: 'services', label: '服務項目', href: '/#services', order: 2 },
      { id: 'process', label: '服務流程', href: '/#process', order: 3 },
      { id: 'news', label: '即時新聞', href: '/#news', order: 4 },
      { id: 'knowledge', label: '徵信知識', href: '/#knowledge', order: 5 },
      { id: 'faq', label: '常見問題', href: '/#faq', order: 6 },
      { id: 'contact', label: '聯絡諮詢', href: '/#contact', order: 7 },
    ]
  },
  {
    id: 'footer',
    name: 'footer',
    items: [
      { id: 'f-about', label: '關於瑞信', href: '/#about', order: 0 },
      { id: 'f-services', label: '服務項目', href: '/#services', order: 1 },
      { id: 'f-process', label: '服務流程', href: '/#process', order: 2 },
      { id: 'f-news', label: '即時新聞', href: '/#news', order: 3 },
      { id: 'f-knowledge', label: '徵信知識', href: '/#knowledge', order: 4 },
      { id: 'f-faq', label: '常見問題', href: '/#faq', order: 5 },
      { id: 'f-contact', label: '聯絡諮詢', href: '/#contact', order: 6 },
    ]
  }
];

export const menuService = {
  getMenus: async (): Promise<Menu[]> => {
    if (USE_API) {
      try {
        const menus = await menuApi.getMenus();
        return menus;
      } catch (error) {
        console.error('Failed to fetch menus from API, using fallback:', error);
        return defaultMenus;
      }
    }

    // Fallback to localStorage
    const stored = localStorage.getItem('ruixin_menus');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultMenus;
      }
    }
    localStorage.setItem('ruixin_menus', JSON.stringify(defaultMenus));
    return defaultMenus;
  },

  getMenu: async (name: 'header' | 'footer'): Promise<Menu | undefined> => {
    const menus = await menuService.getMenus();
    return menus.find(m => m.name === name);
  },

  updateMenu: async (name: 'header' | 'footer', items: MenuItem[]): Promise<void> => {
    if (USE_API) {
      await menuApi.updateMenu(name, items);
    } else {
      const menus = await menuService.getMenus();
      const index = menus.findIndex(m => m.name === name);
      if (index !== -1) {
        menus[index].items = items;
      } else {
        menus.push({ id: name, name, items });
      }
      localStorage.setItem('ruixin_menus', JSON.stringify(menus));
    }
  },

  addMenuItem: async (name: 'header' | 'footer', item: MenuItem): Promise<void> => {
    if (USE_API) {
      await menuApi.addMenuItem(name, item);

      // Auto-create page for menu item if it's not a hash link
      if (!item.href.startsWith('/#') && !item.href.startsWith('#')) {
        const slug = item.href.replace(/^\//, '').replace(/\/$/, '');
        if (slug) {
          try {
            await pageApi.getPage(slug);
          } catch {
            // Page doesn't exist, create it
            await pageApi.createPage({
              slug,
              title: item.label,
              description: `${item.label} 頁面`,
              content: `<h1>${item.label}</h1><p>此頁面內容待編輯。</p>`,
              metaTitle: item.label,
              metaDescription: `${item.label} - 瑞信徵信社`,
              isPublished: true
            });
          }
        }
      }
    } else {
      const menu = await menuService.getMenu(name);
      if (menu) {
        menu.items.push(item);
        await menuService.updateMenu(name, menu.items);

        // Auto-create page for menu item if it's not a hash link
        if (!item.href.startsWith('/#') && !item.href.startsWith('#')) {
          const slug = item.href.replace(/^\//, '').replace(/\/$/, '');
          if (slug && !pageService.getPage(slug)) {
            pageService.createPage({
              slug,
              title: item.label,
              description: `${item.label} 頁面`,
              content: `<h1>${item.label}</h1><p>此頁面內容待編輯。</p>`,
              metaTitle: item.label,
              metaDescription: `${item.label} - 瑞信徵信社`,
              isPublished: true
            });
          }
        }
      }
    }
  },

  removeMenuItem: async (name: 'header' | 'footer', itemId: string): Promise<void> => {
    if (USE_API) {
      await menuApi.deleteMenuItem(itemId);
    } else {
      const menu = await menuService.getMenu(name);
      if (menu) {
        menu.items = menu.items.filter(item => item.id !== itemId);
        await menuService.updateMenu(name, menu.items);
      }
    }
  }
};

// ---------- CONTENT ----------
export interface ContentSection {
  id: string;
  title: string;
  content: Record<string, string>;
  updatedAt: string;
}

const defaultContent: ContentSection[] = [
  {
    id: 'hero',
    title: 'Hero Section',
    content: {
      tag: '專業資訊調查與風險評估',
      title: '瑞信徵信社｜專業調查、合法程序、重視保密',
      subtitle: '專業調查｜合法程序｜重視保密',
      desc: '面對關係疑慮、商業合作與重要決策，正確資訊是釐清問題的第一步。瑞信徵信社透過專業資訊整理與合法調查程序，協助個人與企業掌握事實、降低風險。'
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'about',
    title: 'About Section',
    content: {
      tag: '關於瑞信',
      title: '以事實為基礎，協助您做出更清楚的判斷',
      desc1: '瑞信徵信社以專業、客觀與保密為服務原則，提供婚姻徵信、商業調查及企業風險管理相關服務。',
      desc2: '我們重視每一項委託背後的實際需求，從初步諮詢、問題評估到資訊整理，皆以合法程序與謹慎態度進行。',
      desc3: '徵信服務的目的，不是製造衝突，而是協助委託人降低資訊落差、釐清事實，為後續行動提供更完整的判斷依據。',
      quote: '真相，是每一次正確決策的開始。'
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'footer',
    title: 'Footer Section',
    content: {
      logo: '瑞信徵信社',
      desc: '提供婚姻徵信、商業調查與企業風險管理相關服務，協助個人與企業釐清資訊、降低風險。',
      disclaimer: '本網站內容為一般資訊與服務介紹，不構成法律意見。實際案件應依個別情況進行評估，必要時應諮詢專業律師。',
      copyright: '© 2026 瑞信徵信社 All Rights Reserved.'
    },
    updatedAt: new Date().toISOString()
  }
];

export const contentService = {
  getContent: async (): Promise<ContentSection[]> => {
    if (USE_API) {
      try {
        const content = await contentApi.getContent();
        return content;
      } catch (error) {
        console.error('Failed to fetch content from API, using fallback:', error);
        return defaultContent;
      }
    }

    const stored = localStorage.getItem('ruixin_content');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultContent;
      }
    }
    localStorage.setItem('ruixin_content', JSON.stringify(defaultContent));
    return defaultContent;
  },

  getSection: async (id: string): Promise<ContentSection | undefined> => {
    const sections = await contentService.getContent();
    return sections.find(s => s.id === id);
  },

  updateSection: async (id: string, content: Record<string, string>): Promise<void> => {
    if (USE_API) {
      await contentApi.updateContent(id, content);
    } else {
      const sections = await contentService.getContent();
      const index = sections.findIndex(s => s.id === id);
      if (index !== -1) {
        sections[index].content = content;
        sections[index].updatedAt = new Date().toISOString();
      } else {
        sections.push({
          id,
          title: id,
          content,
          updatedAt: new Date().toISOString()
        });
      }
      localStorage.setItem('ruixin_content', JSON.stringify(sections));
    }
  }
};

// ---------- RSS FEEDS ----------
export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  categories: string[];
  is_active: boolean;
  created_at: string;
}

const defaultFeeds: RSSFeed[] = [
  {
    id: '1',
    name: '中華超傳媒',
    url: 'https://chinanewscloud.com/api/v1/rss-news',
    categories: ['財經新聞', '產經新聞', '房產新聞', '產業新聞', '最新消息', '兩岸新聞', '社會政治', '國際要聞', '資訊科技'],
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const rssService = {
  getFeeds: async (): Promise<RSSFeed[]> => {
    if (USE_API) {
      try {
        const feeds = await rssApi.getFeeds();
        return feeds;
      } catch (error) {
        console.error('Failed to fetch feeds from API, using fallback:', error);
        return defaultFeeds;
      }
    }

    const stored = localStorage.getItem('ruixin_rss_feeds');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultFeeds;
      }
    }
    localStorage.setItem('ruixin_rss_feeds', JSON.stringify(defaultFeeds));
    return defaultFeeds;
  },

  addFeed: async (feed: Omit<RSSFeed, 'id' | 'created_at'>): Promise<RSSFeed> => {
    if (USE_API) {
      const result = await rssApi.addFeed(feed);
      return result.feed;
    }

    const feeds = await rssService.getFeeds();
    const newFeed: RSSFeed = {
      ...feed,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    feeds.push(newFeed);
    localStorage.setItem('ruixin_rss_feeds', JSON.stringify(feeds));
    return newFeed;
  },

  updateFeed: async (id: string, data: Partial<RSSFeed>): Promise<void> => {
    if (USE_API) {
      await rssApi.updateFeed(id, data);
    } else {
      const feeds = await rssService.getFeeds();
      const index = feeds.findIndex(f => f.id === id);
      if (index !== -1) {
        feeds[index] = { ...feeds[index], ...data };
        localStorage.setItem('ruixin_rss_feeds', JSON.stringify(feeds));
      }
    }
  },

  deleteFeed: async (id: string): Promise<void> => {
    if (USE_API) {
      await rssApi.deleteFeed(id);
    } else {
      const feeds = await rssService.getFeeds();
      const filtered = feeds.filter(f => f.id !== id);
      localStorage.setItem('ruixin_rss_feeds', JSON.stringify(filtered));
    }
  },

  toggleFeed: async (id: string): Promise<void> => {
    if (USE_API) {
      await rssApi.toggleFeed(id);
    } else {
      const feeds = await rssService.getFeeds();
      const index = feeds.findIndex(f => f.id === id);
      if (index !== -1) {
        feeds[index].is_active = !feeds[index].is_active;
        localStorage.setItem('ruixin_rss_feeds', JSON.stringify(feeds));
      }
    }
  }
};

// ---------- PAGES ----------
export interface Page {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const defaultPages: Page[] = [
  {
    id: '1',
    slug: 'about',
    title: '關於我們',
    description: '瑞信徵信社簡介',
    content: '<h2>關於瑞信徵信社</h2><p>瑞信徵信社以專業、客觀與保密為服務原則...</p>',
    meta_title: '關於瑞信徵信社',
    meta_description: '了解瑞信徵信社的專業服務',
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const pageService = {
  getPages: async (): Promise<Page[]> => {
    if (USE_API) {
      try {
        const pages = await pageApi.getPages();
        return pages;
      } catch (error) {
        console.error('Failed to fetch pages from API, using fallback:', error);
        return defaultPages;
      }
    }

    const stored = localStorage.getItem('ruixin_pages');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultPages;
      }
    }
    localStorage.setItem('ruixin_pages', JSON.stringify(defaultPages));
    return defaultPages;
  },

  getPage: async (slug: string): Promise<Page | undefined> => {
    if (USE_API) {
      try {
        const page = await pageApi.getPage(slug);
        return page;
      } catch (error) {
        return undefined;
      }
    }

    const pages = await pageService.getPages();
    return pages.find(p => p.slug === slug && p.is_published);
  },

  getPageById: async (id: string): Promise<Page | undefined> => {
    const pages = await pageService.getPages();
    return pages.find(p => p.id === id);
  },

  createPage: async (page: Omit<Page, 'id' | 'created_at' | 'updated_at'>): Promise<Page> => {
    if (USE_API) {
      const result = await pageApi.createPage(page);
      return result.page;
    }

    const pages = await pageService.getPages();
    const newPage: Page = {
      ...page,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    pages.push(newPage);
    localStorage.setItem('ruixin_pages', JSON.stringify(pages));
    return newPage;
  },

  updatePage: async (id: string, data: Partial<Page>): Promise<void> => {
    if (USE_API) {
      await pageApi.updatePage(id, data);
    } else {
      const pages = await pageService.getPages();
      const index = pages.findIndex(p => p.id === id);
      if (index !== -1) {
        pages[index] = { ...pages[index], ...data, updated_at: new Date().toISOString() };
        localStorage.setItem('ruixin_pages', JSON.stringify(pages));
      }
    }
  },

  deletePage: async (id: string): Promise<void> => {
    if (USE_API) {
      await pageApi.deletePage(id);
    } else {
      const pages = await pageService.getPages();
      const filtered = pages.filter(p => p.id !== id);
      localStorage.setItem('ruixin_pages', JSON.stringify(filtered));
    }
  },

  togglePublish: async (id: string): Promise<void> => {
    if (USE_API) {
      await pageApi.togglePublish(id);
    } else {
      const pages = await pageService.getPages();
      const index = pages.findIndex(p => p.id === id);
      if (index !== -1) {
        pages[index].is_published = !pages[index].is_published;
        pages[index].updated_at = new Date().toISOString();
        localStorage.setItem('ruixin_pages', JSON.stringify(pages));
      }
    }
  }
};

// ---------- MEDIA ----------
export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  created_at: string;
}

export const mediaService = {
  getMedia: async (): Promise<MediaItem[]> => {
    if (USE_API) {
      try {
        const media = await mediaApi.getMedia();
        return media;
      } catch (error) {
        console.error('Failed to fetch media from API, using fallback:', error);
        return [];
      }
    }

    const stored = localStorage.getItem('ruixin_media');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  },

  addMedia: async (file: File): Promise<MediaItem> => {
    if (USE_API) {
      const result = await mediaApi.uploadMedia(file);
      return result.media;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const url = e.target?.result as string;
          const media: MediaItem = {
            id: Date.now().toString(),
            name: file.name,
            url: url,
            type: file.type.startsWith('image/') ? 'image' : 'document',
            size: file.size,
            created_at: new Date().toISOString()
          };

          const existing = await mediaService.getMedia();
          existing.push(media);
          localStorage.setItem('ruixin_media', JSON.stringify(existing));
          resolve(media);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  deleteMedia: async (id: string): Promise<void> => {
    if (USE_API) {
      await mediaApi.deleteMedia(id);
    } else {
      const media = await mediaService.getMedia();
      const filtered = media.filter(m => m.id !== id);
      localStorage.setItem('ruixin_media', JSON.stringify(filtered));
    }
  }
};