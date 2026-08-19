// ─────────────────────────────────────────────────────────────
//  newsService.ts  —  Pure JS/TS RSS fetch, zero PHP dependency
//
//  Local dev  : Vite proxy  /api/rss  →  chinanewscloud.com RSS
//  Production : same /api/rss path, handled by .htaccess redirect
//               OR direct fetch with CORS proxy fallback
// ─────────────────────────────────────────────────────────────

const RSS_URL = 'https://chinanewscloud.com/api/v1/rss-news';

// Categories relevant for 瑞信徵信社 — filter everything else out
// If the feed changes and 0 items match, we fall back to showing all.
const ALLOWED_CATEGORIES = new Set([
  '財經新聞',
  '產經新聞',
  '房產新聞',
  '產業新聞',
  '最新消息',
  '兩岸新聞',
  '社會政治',
  '國際要聞',
  '資訊科技',
]);

export type NewsItem = {
  slug: string;
  title: string;
  link: string;
  date: string;
  description: string;
  image?: string;
  category: string;
  content_html?: string;
};

// ── Regex-based RSS parser ────────────────────────────────────
// We intentionally avoid DOMParser for the top-level <link> tag because
// RSS 2.0 uses a plain text <link> that DOMParser often drops or confuses
// with Atom's self-closing <link rel="..."> element.

function extractCDATA(src: string): string {
  const m = src.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return m ? m[1].trim() : src.replace(/<[^>]+>/g, '').trim();
}

function getTagContent(xml: string, tag: string): string {
  // Handles both CDATA and plain text content
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  if (!m) return '';
  return extractCDATA(m[1]) || m[1].replace(/<[^>]+>/g, '').trim();
}

function getAttrValue(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]+${attr}=["']([^"']+)["']`, 'i');
  const m = xml.match(re);
  return m ? m[1].trim() : '';
}

function normalizeUrl(url: string): string {
  const t = url.trim();
  if (!t) return '';
  if (t.startsWith('//')) return 'https:' + t;
  if (t.startsWith('/')) return 'https://chinanewscloud.com' + t;
  return t;
}

function makeSlug(link: string, title: string): string {
  try {
    const u = new URL(link);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length > 0) return decodeURIComponent(parts[parts.length - 1]);
  } catch { /* fallback */ }
  return title.trim().replace(/[^\w\u4e00-\u9fa5]+/g, '-').slice(0, 80).replace(/^-|-$/g, '');
}

function extractFirstImage(html: string): string {
  if (!html) return '';
  const m = html.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
  return m ? normalizeUrl(m[1]) : '';
}

function parseRSS(raw: string): NewsItem[] {
  // Split on <item> boundaries
  const itemChunks = raw.split(/<item[\s>]/i).slice(1);
  const seen = new Set<string>();
  const news: NewsItem[] = [];

  itemChunks.forEach((chunk, idx) => {
    // Trim to end of </item>
    const end = chunk.indexOf('</item>');
    const xml = end !== -1 ? chunk.slice(0, end) : chunk;

    const title = getTagContent(xml, 'title');
    if (!title || title.length < 3 || seen.has(title)) return;
    seen.add(title);

    // guid is more reliable than <link> in RSS 2.0 for actual article URL
    const guid = getTagContent(xml, 'guid');
    const linkTag = getTagContent(xml, 'link');
    const link = (guid.startsWith('http') ? guid : linkTag) || '';

    const pubDate = getTagContent(xml, 'pubDate');
    const description = getTagContent(xml, 'description');
    const category = getTagContent(xml, 'category') || '產經新聞';

    // content:encoded — strip namespace prefix variants
    const contentMatch = xml.match(/<(?:content:encoded|content)[^>]*>([\s\S]*?)<\/(?:content:encoded|content)>/i);
    const contentHtml = contentMatch ? extractCDATA(contentMatch[1]) : '';

    // Image: enclosure → media → first <img> in content/description
    let image = getAttrValue(xml, 'enclosure', 'url');
    if (!image) image = getAttrValue(xml, 'media', 'url');
    if (!image) image = extractFirstImage(contentHtml || description);
    if (image) image = normalizeUrl(image);

    const cleanDesc = description
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 250);

    news.push({
      slug: makeSlug(link, title) || `article-${idx}`,
      title,
      link,
      date: pubDate,
      description: cleanDesc,
      image: image || undefined,
      category,
      content_html: contentHtml || cleanDesc,
    });
  });

  return news;
}

// ── Fetch with fallback chain ─────────────────────────────────

async function tryFetch(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  // Reject HTML error pages
  const head = text.trimStart().slice(0, 15).toLowerCase();
  if (head.startsWith('<!doctype') || head.startsWith('<html')) {
    throw new Error('Got HTML instead of RSS feed');
  }
  return text;
}

async function fetchRSS(): Promise<string> {
  // 1. /api/rss  — Vite proxy on local dev, or .htaccess rewrite on production
  // 2. direct RSS URL (works when server has no CORS restriction)
  // 3. corsproxy.io — public CORS proxy as last resort
  const urls = [
    '/api/rss',
    RSS_URL,
    `https://corsproxy.io/?${encodeURIComponent(RSS_URL)}`,
  ];

  for (const url of urls) {
    try {
      const text = await tryFetch(url);
      console.log('✅ RSS loaded via:', url);
      return text;
    } catch (e) {
      console.warn('⚠️ RSS failed:', url, (e as Error).message);
    }
  }

  throw new Error('All RSS sources failed');
}

// ── Public API ────────────────────────────────────────────────

export async function fetchNews(): Promise<{
  success: boolean;
  news: NewsItem[];
  message?: string;
}> {
  try {
    const raw = await fetchRSS();
    const all = parseRSS(raw);
    console.log(`Parsed ${all.length} items from RSS`);

    const filtered = all.filter(item => ALLOWED_CATEGORIES.has(item.category));
    const news = filtered.length > 0 ? filtered : all;
    console.log(`Showing ${news.length} items after category filter`);

    return { success: true, news };
  } catch (error) {
    console.error('fetchNews error:', error);
    return {
      success: false,
      news: [],
      message: error instanceof Error ? error.message : 'Unable to load news',
    };
  }
}

export async function fetchNewsArticle(slug: string): Promise<{
  success: boolean;
  article?: NewsItem;
  message?: string;
}> {
  try {
    const raw = await fetchRSS();
    const all = parseRSS(raw);
    const article = all.find(item => item.slug === slug);

    if (article) return { success: true, article };
    return { success: false, message: 'Article not found' };
  } catch (error) {
    console.error('fetchNewsArticle error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to load article',
    };
  }
}
