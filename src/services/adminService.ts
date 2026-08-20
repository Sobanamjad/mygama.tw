// Admin service with LocalStorage

const ADMIN_KEY = 'ruixin_admin';
const MENU_KEY = 'ruixin_menus';
const CONTENT_KEY = 'ruixin_content';
const RSS_FEEDS_KEY = 'ruixin_rss_feeds';
const PAGES_KEY = 'ruixin_pages';
const MEDIA_KEY = 'ruixin_media';

// ---------- AUTH ----------
export const adminAuth = {
  login: (username: string, password: string) => {
    // Default admin credentials
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = btoa(`${username}:${Date.now()}`);
      localStorage.setItem(ADMIN_KEY, token);
      return { success: true, token };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  logout: () => {
    localStorage.removeItem(ADMIN_KEY);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(ADMIN_KEY);
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
  getMenus: (): Menu[] => {
    const stored = localStorage.getItem(MENU_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultMenus;
      }
    }
    // Initialize with defaults
    localStorage.setItem(MENU_KEY, JSON.stringify(defaultMenus));
    return defaultMenus;
  },

  getMenu: (name: 'header' | 'footer'): Menu | undefined => {
    const menus = menuService.getMenus();
    return menus.find(m => m.name === name);
  },

  updateMenu: (name: 'header' | 'footer', items: MenuItem[]): void => {
    const menus = menuService.getMenus();
    const index = menus.findIndex(m => m.name === name);
    if (index !== -1) {
      menus[index].items = items;
    } else {
      menus.push({ id: name, name, items });
    }
    localStorage.setItem(MENU_KEY, JSON.stringify(menus));
  },

  addMenuItem: (name: 'header' | 'footer', item: MenuItem): void => {
    const menu = menuService.getMenu(name);
    if (menu) {
      menu.items.push(item);
      menuService.updateMenu(name, menu.items);
    }
  },

  removeMenuItem: (name: 'header' | 'footer', itemId: string): void => {
    const menu = menuService.getMenu(name);
    if (menu) {
      menu.items = menu.items.filter(item => item.id !== itemId);
      menuService.updateMenu(name, menu.items);
    }
  }
};

// ---------- CONTENT ----------
export interface ContentSection {
  id: string;
  title: string;
  content: Record<string, string>; // Key-value pairs
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
  getContent: (): ContentSection[] => {
    const stored = localStorage.getItem(CONTENT_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultContent;
      }
    }
    localStorage.setItem(CONTENT_KEY, JSON.stringify(defaultContent));
    return defaultContent;
  },

  getSection: (id: string): ContentSection | undefined => {
    const sections = contentService.getContent();
    return sections.find(s => s.id === id);
  },

  updateSection: (id: string, content: Record<string, string>): void => {
    const sections = contentService.getContent();
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
    localStorage.setItem(CONTENT_KEY, JSON.stringify(sections));
  }
};

// ---------- RSS FEEDS ----------
export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  categories: string[];
  isActive: boolean;
  createdAt: string;
}

const defaultFeeds: RSSFeed[] = [
  {
    id: '1',
    name: '中華超傳媒',
    url: 'https://chinanewscloud.com/api/v1/rss-news',
    categories: ['財經新聞', '產經新聞', '房產新聞', '產業新聞', '最新消息', '兩岸新聞', '社會政治', '國際要聞', '資訊科技'],
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const rssService = {
  getFeeds: (): RSSFeed[] => {
    const stored = localStorage.getItem(RSS_FEEDS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultFeeds;
      }
    }
    localStorage.setItem(RSS_FEEDS_KEY, JSON.stringify(defaultFeeds));
    return defaultFeeds;
  },

  addFeed: (feed: Omit<RSSFeed, 'id' | 'createdAt'>): RSSFeed => {
    const feeds = rssService.getFeeds();
    const newFeed: RSSFeed = {
      ...feed,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    feeds.push(newFeed);
    localStorage.setItem(RSS_FEEDS_KEY, JSON.stringify(feeds));
    return newFeed;
  },

  updateFeed: (id: string, data: Partial<RSSFeed>): void => {
    const feeds = rssService.getFeeds();
    const index = feeds.findIndex(f => f.id === id);
    if (index !== -1) {
      feeds[index] = { ...feeds[index], ...data };
      localStorage.setItem(RSS_FEEDS_KEY, JSON.stringify(feeds));
    }
  },

  deleteFeed: (id: string): void => {
    const feeds = rssService.getFeeds();
    const filtered = feeds.filter(f => f.id !== id);
    localStorage.setItem(RSS_FEEDS_KEY, JSON.stringify(filtered));
  },

  toggleFeed: (id: string): void => {
    const feeds = rssService.getFeeds();
    const index = feeds.findIndex(f => f.id === id);
    if (index !== -1) {
      feeds[index].isActive = !feeds[index].isActive;
      localStorage.setItem(RSS_FEEDS_KEY, JSON.stringify(feeds));
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
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const defaultPages: Page[] = [
  {
    id: '1',
    slug: 'about',
    title: '關於我們',
    description: '瑞信徵信社簡介',
    content: '<h2>關於瑞信徵信社</h2><p>瑞信徵信社以專業、客觀與保密為服務原則...</p>',
    metaTitle: '關於瑞信徵信社',
    metaDescription: '了解瑞信徵信社的專業服務',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const pageService = {
  getPages: (): Page[] => {
    const stored = localStorage.getItem(PAGES_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultPages;
      }
    }
    localStorage.setItem(PAGES_KEY, JSON.stringify(defaultPages));
    return defaultPages;
  },

  getPage: (slug: string): Page | undefined => {
    const pages = pageService.getPages();
    return pages.find(p => p.slug === slug && p.isPublished);
  },

  getPageById: (id: string): Page | undefined => {
    const pages = pageService.getPages();
    return pages.find(p => p.id === id);
  },

  createPage: (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Page => {
    const pages = pageService.getPages();
    const newPage: Page = {
      ...page,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    pages.push(newPage);
    localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
    return newPage;
  },

  updatePage: (id: string, data: Partial<Page>): void => {
    const pages = pageService.getPages();
    const index = pages.findIndex(p => p.id === id);
    if (index !== -1) {
      pages[index] = { ...pages[index], ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
    }
  },

  deletePage: (id: string): void => {
    const pages = pageService.getPages();
    const filtered = pages.filter(p => p.id !== id);
    localStorage.setItem(PAGES_KEY, JSON.stringify(filtered));
  },

  togglePublish: (id: string): void => {
    const pages = pageService.getPages();
    const index = pages.findIndex(p => p.id === id);
    if (index !== -1) {
      pages[index].isPublished = !pages[index].isPublished;
      pages[index].updatedAt = new Date().toISOString();
      localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
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
  uploadedAt: string;
}

export const mediaService = {
  getMedia: (): MediaItem[] => {
    const stored = localStorage.getItem(MEDIA_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  },

  addMedia: (file: File): Promise<MediaItem> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const url = e.target?.result as string;
          const media: MediaItem = {
            id: Date.now().toString(),
            name: file.name,
            url: url,
            type: file.type.startsWith('image/') ? 'image' : 'document',
            size: file.size,
            uploadedAt: new Date().toISOString()
          };
          
          const existing = mediaService.getMedia();
          existing.push(media);
          localStorage.setItem(MEDIA_KEY, JSON.stringify(existing));
          resolve(media);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  deleteMedia: (id: string): void => {
    const media = mediaService.getMedia();
    const filtered = media.filter(m => m.id !== id);
    localStorage.setItem(MEDIA_KEY, JSON.stringify(filtered));
  }
};