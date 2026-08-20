import { useState, useEffect } from 'react';
import './App.css';
import './news-pages.css';
import './admin/admin.css';
import NewsDetail from './NewsDetail';
import { fetchNews, type NewsItem } from './newsService';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { 
  adminAuth, 
  menuService, 
  contentService,
  type MenuItem 
} from './services/adminService';

function App() {
  // ===== ADMIN STATE =====
  const [isAdmin, setIsAdmin] = useState(() => adminAuth.isAuthenticated());

  // ===== UI STATE =====
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ===== NEWS STATE =====
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');
  const [selectedNewsCategory, setSelectedNewsCategory] = useState('全部分類');
  const [visibleNewsCount, setVisibleNewsCount] = useState(12);

  // ===== ADMIN DATA =====
  const [headerMenu, setHeaderMenu] = useState<MenuItem[]>([]);
  const [footerMenu, setFooterMenu] = useState<MenuItem[]>([]);
  const [content, setContent] = useState<any[]>([]);

  // ===== LOAD ADMIN DATA =====
  useEffect(() => {
    // Load menus
    const menus = menuService.getMenus();
    const header = menus.find(m => m.name === 'header');
    const footer = menus.find(m => m.name === 'footer');
    if (header) setHeaderMenu(header.items);
    if (footer) setFooterMenu(footer.items);

    // Load content
    const contentData = contentService.getContent();
    setContent(contentData);
  }, []);

  // ===== CHECK ADMIN ROUTE =====
  useEffect(() => {
    setIsAdmin(adminAuth.isAuthenticated());
  }, []);

  const handleLogin = () => {
    setIsAdmin(true);
  };

  const isAdminRoute = window.location.pathname === '/admin';
  const pathname = decodeURIComponent(window.location.pathname);
  const isNewsDetail = pathname.startsWith('/news/');

  // ===== ADMIN ROUTE =====
  if (isAdminRoute) {
    if (!isAdmin) {
      return <AdminLogin onLogin={handleLogin} />;
    }
    return <AdminDashboard />;
  }

  // ===== NEWS DETAIL ROUTE =====
  if (isNewsDetail) {
    const slug = pathname.replace(/^\/news\//, '');
    return <NewsDetail slug={slug} />;
  }

  // ===== LOAD NEWS =====
  useEffect(() => {
    const loadNews = async () => {
      try {
        setNewsLoading(true);
        setNewsError('');
        const data = await fetchNews();
        if (!data.success || !Array.isArray(data.news)) {
          throw new Error(data.message || 'Invalid news response');
        }
        setNews(data.news);
      } catch (error) {
        console.error('News loading error:', error);
        setNewsError('目前無法載入新聞，請稍後再試。');
      } finally {
        setNewsLoading(false);
      }
    };

    loadNews();
  }, []);

  // ===== SCROLL EFFECT =====
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ===== CATEGORIES =====
  const rssCategories = Array.from(
    new Set(news.map((item) => item.category).filter(Boolean))
  );
  const newsCategories = ['全部分類', ...rssCategories];

  const categoryNews =
    selectedNewsCategory === '全部分類'
      ? news
      : news.filter((item) => item.category === selectedNewsCategory);

  const filteredNews = categoryNews.slice(0, visibleNewsCount);

  const categoryCount = (category: string) =>
    category === '全部分類'
      ? news.length
      : news.filter((item) => item.category === category).length;

  useEffect(() => {
    setVisibleNewsCount(12);
  }, [selectedNewsCategory]);

  // ===== HELPERS FOR CONTENT =====
  const getContentField = (sectionId: string, fieldKey: string, defaultValue: string = '') => {
    const section = content.find(c => c.id === sectionId);
    return section?.content?.[fieldKey] || defaultValue;
  };

  // ===== RENDER =====
  return (
    <div className="app">
      {/* ===== HEADER ===== */}
      <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
        <div className="container header-container">
          <a href="#home" className="logo">
            {getContentField('footer', 'logo', '瑞信徵信社')}
          </a>

          <nav className="nav-desktop">
            {headerMenu.map((item) => (
              <a key={item.id} href={item.href}>
                {item.label}
              </a>
            ))}
            <a href="#contact" className="btn-primary">
              {getContentField('header', 'ctaText', '立即諮詢')}
            </a>
          </nav>

          <button
            className="menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="nav-mobile">
            {headerMenu.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              className="btn-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {getContentField('header', 'ctaText', '立即諮詢')}
            </a>
          </nav>
        )}
      </header>

      {/* ===== HERO SECTION ===== */}
      <section id="home" className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <p className="hero-tag">
              {getContentField('hero', 'tag', '專業資訊調查與風險評估')}
            </p>
            <h1 className="hero-title">
              {getContentField('hero', 'title', '瑞信徵信社｜專業調查、合法程序、重視保密')}
            </h1>
            <p className="hero-subtitle">
              {getContentField('hero', 'subtitle', '專業調查｜合法程序｜重視保密')}
            </p>
            <p className="hero-desc">
              {getContentField('hero', 'desc', '面對關係疑慮、商業合作與重要決策，正確資訊是釐清問題的第一步。瑞信徵信社透過專業資訊整理與合法調查程序，協助個人與企業掌握事實、降低風險。')}
            </p>
            <div className="hero-buttons">
              <a href="#contact" className="btn-primary">
                {getContentField('hero', 'ctaPrimary', '立即諮詢')}
              </a>
              <a href="#services" className="btn-secondary">
                {getContentField('hero', 'ctaSecondary', '了解服務')}
              </a>
            </div>
            <ul className="hero-badges">
              <li>{getContentField('hero', 'badge1', '專業分析')}</li>
              <li>{getContentField('hero', 'badge2', '合法程序')}</li>
              <li>{getContentField('hero', 'badge3', '客觀評估')}</li>
              <li>{getContentField('hero', 'badge4', '資訊保密')}</li>
            </ul>
          </div>
          <div className="hero-image">
            <div className="hero-image-wrapper">
              <img
                src={getContentField('hero', 'image', '/hero.png')}
                alt={getContentField('hero', 'title', '瑞信徵信社專業調查服務')}
                className="hero-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEEDS SECTION ===== */}
      <section id="needs" className="section needs">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">
              {getContentField('needs', 'tag', '常見需求')}
            </p>
            <h2 className="section-title">
              {getContentField('needs', 'title', '當資訊不足，重要決定往往更加困難')}
            </h2>
            <p className="section-desc">
              {getContentField('needs', 'desc', '有些疑問無法只靠猜測確認，有些合作也不能只憑表面資訊判斷。瑞信從實際需求出發，協助整理資訊、確認方向，逐步釐清問題。')}
            </p>
          </div>
          <div className="needs-grid">
            <div className="card">
              <span className="card-line"></span>
              <h3>{getContentField('needs', 'card1Title', '關係中的疑慮')}</h3>
              <p>{getContentField('needs', 'card1Desc', '當關係出現異常或資訊不一致時，透過合法方式了解狀況，避免在情緒與猜測中做出決定。')}</p>
            </div>
            <div className="card">
              <span className="card-line"></span>
              <h3>{getContentField('needs', 'card2Title', '合作前的查核')}</h3>
              <p>{getContentField('needs', 'card2Desc', '在建立合作、交易或委任關係前，先了解相關背景資訊，降低資訊不對稱造成的風險。')}</p>
            </div>
            <div className="card">
              <span className="card-line"></span>
              <h3>{getContentField('needs', 'card3Title', '企業決策風險')}</h3>
              <p>{getContentField('needs', 'card3Desc', '面對重要商業決策時，透過資訊整理與風險分析，提高決策的完整度與安全性。')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="section about">
        <div className="container about-container">
          <div className="about-header">
            <p className="section-tag">
              {getContentField('about', 'tag', '關於瑞信')}
            </p>
            <h2 className="section-title">
              {getContentField('about', 'title', '以事實為基礎，協助您做出更清楚的判斷')}
            </h2>
          </div>
          <div className="about-content">
            <p>{getContentField('about', 'desc1', '瑞信徵信社以專業、客觀與保密為服務原則，提供婚姻徵信、商業調查及企業風險管理相關服務。')}</p>
            <p>{getContentField('about', 'desc2', '我們重視每一項委託背後的實際需求，從初步諮詢、問題評估到資訊整理，皆以合法程序與謹慎態度進行。')}</p>
            <p>{getContentField('about', 'desc3', '徵信服務的目的，不是製造衝突，而是協助委託人降低資訊落差、釐清事實，為後續行動提供更完整的判斷依據。')}</p>
            <blockquote>
              {getContentField('about', 'quote', '真相，是每一次正確決策的開始。')}
            </blockquote>
          </div>
        </div>
      </section>

      {/* ===== SERVICES SECTION ===== */}
      <section id="services" className="section services">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">
              {getContentField('services', 'tag', '服務項目')}
            </p>
            <h2 className="section-title">
              {getContentField('services', 'title', '個人與企業的專業調查服務')}
            </h2>
            <p className="section-desc">
              {getContentField('services', 'desc', '依照不同情境與需求，提供適合的資訊調查與風險評估方向。')}
            </p>
          </div>
          <div className="services-grid">
            {/* Service 1: Marriage */}
            <div className="service-card">
              <div className="service-image">
                <img
                  src={getContentField('services', 'service1Image', '/marriage.jpg')}
                  alt={getContentField('services', 'service1Title', '婚姻徵信服務')}
                  className="service-img"
                />
              </div>
              <div className="service-content">
                <h3>{getContentField('services', 'service1Title', '婚姻徵信')}</h3>
                <p className="service-sub">
                  {getContentField('services', 'service1Sub', '婚姻與關係資訊釐清')}
                </p>
                <p className="service-desc">
                  {getContentField('services', 'service1Desc', '當婚姻或伴侶關係出現疑慮時，單靠猜測容易加深不安與衝突。瑞信協助委託人整理需求，透過合法程序了解相關資訊。')}
                </p>
                <ul className="service-list">
                  <li>{getContentField('services', 'service1List1', '婚姻狀況相關資訊確認')}</li>
                  <li>{getContentField('services', 'service1List2', '關係疑問與異常情況釐清')}</li>
                  <li>{getContentField('services', 'service1List3', '婚前背景資訊了解')}</li>
                  <li>{getContentField('services', 'service1List4', '合法蒐證方向諮詢')}</li>
                  <li>{getContentField('services', 'service1List5', '家庭與關係問題資訊整理')}</li>
                </ul>
                <a href="#contact" className="btn-outline">
                  {getContentField('services', 'service1Btn', '了解婚姻徵信')}
                </a>
              </div>
            </div>

            {/* Service 2: Business */}
            <div className="service-card">
              <div className="service-image">
                <img
                  src={getContentField('services', 'service2Image', '/business.jpg')}
                  alt={getContentField('services', 'service2Title', '商業調查服務')}
                  className="service-img"
                />
              </div>
              <div className="service-content">
                <h3>{getContentField('services', 'service2Title', '商業調查')}</h3>
                <p className="service-sub">
                  {getContentField('services', 'service2Sub', '合作之前，先了解潛在風險')}
                </p>
                <p className="service-desc">
                  {getContentField('services', 'service2Desc', '商業合作常伴隨資訊不對稱。瑞信協助企業與個人進行合作前資訊查核，整理可取得的背景資訊與潛在風險。')}
                </p>
                <ul className="service-list">
                  <li>{getContentField('services', 'service2List1', '合作對象背景資訊查核')}</li>
                  <li>{getContentField('services', 'service2List2', '商業合作風險評估')}</li>
                  <li>{getContentField('services', 'service2List3', '企業與廠商資訊整理')}</li>
                  <li>{getContentField('services', 'service2List4', '合作前基本盡職調查')}</li>
                  <li>{getContentField('services', 'service2List5', '商業爭議相關資訊釐清')}</li>
                </ul>
                <a href="#contact" className="btn-outline">
                  {getContentField('services', 'service2Btn', '了解商業調查')}
                </a>
              </div>
            </div>

            {/* Service 3: Risk Management */}
            <div className="service-card">
              <div className="service-image">
                <img
                  src={getContentField('services', 'service3Image', '/risk.jpg')}
                  alt={getContentField('services', 'service3Title', '企業風險管理服務')}
                  className="service-img"
                />
              </div>
              <div className="service-content">
                <h3>{getContentField('services', 'service3Title', '企業風險管理')}</h3>
                <p className="service-sub">
                  {getContentField('services', 'service3Sub', '為重要決策補足關鍵資訊')}
                </p>
                <p className="service-desc">
                  {getContentField('services', 'service3Desc', '企業在合作、管理或重大決策前，若缺乏足夠資訊，容易低估潛在風險。瑞信透過資訊整理、背景查核與風險分析協助企業。')}
                </p>
                <ul className="service-list">
                  <li>{getContentField('services', 'service3List1', '企業背景與關係資訊整理')}</li>
                  <li>{getContentField('services', 'service3List2', '合作風險初步評估')}</li>
                  <li>{getContentField('services', 'service3List3', '重要決策前資訊查核')}</li>
                  <li>{getContentField('services', 'service3List4', '異常情況與爭議資訊分析')}</li>
                  <li>{getContentField('services', 'service3List5', '企業安全與風險管理諮詢')}</li>
                </ul>
                <a href="#contact" className="btn-outline">
                  {getContentField('services', 'service3Btn', '了解企業風險管理')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRINCIPLES SECTION ===== */}
      <section id="principles" className="section principles">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">
              {getContentField('principles', 'tag', '服務原則')}
            </p>
            <h2 className="section-title">
              {getContentField('principles', 'title', '每一項委託，都需要更謹慎的處理')}
            </h2>
          </div>
          <div className="principles-grid">
            <div className="principle-card">
              <span className="principle-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18"/>
                  <path d="M19 8 22 16a5 5 0 0 1-6 0"/>
                  <path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/>
                  <path d="M5 8 2 16a5 5 0 0 0 6 0"/>
                  <path d="M7 21h10"/>
                </svg>
              </span>
              <h3>{getContentField('principles', 'principle1Title', '合法程序')}</h3>
              <p>{getContentField('principles', 'principle1Desc', '依照實際需求評估可行方向，重視法律界線與合法資訊取得方式。')}</p>
            </div>
            <div className="principle-card">
              <span className="principle-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <h3>{getContentField('principles', 'principle2Title', '重視保密')}</h3>
              <p>{getContentField('principles', 'principle2Desc', '重視委託內容與個人資訊，降低敏感資料在服務過程中的暴露風險。')}</p>
            </div>
            <div className="principle-card">
              <span className="principle-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v16a2 2 0 0 0 2 2h16"/>
                  <path d="m19 9-5 5-4-4-3 3"/>
                </svg>
              </span>
              <h3>{getContentField('principles', 'principle3Title', '客觀分析')}</h3>
              <p>{getContentField('principles', 'principle3Desc', '以可確認的資訊為基礎，協助委託人釐清事實，不以猜測取代判斷。')}</p>
            </div>
            <div className="principle-card">
              <span className="principle-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <path d="M12 11h4"/><path d="M12 16h4"/>
                  <path d="M8 11h.01"/><path d="M8 16h.01"/>
                </svg>
              </span>
              <h3>{getContentField('principles', 'principle4Title', '需求評估')}</h3>
              <p>{getContentField('principles', 'principle4Desc', '不同案件有不同背景與目的，先理解問題，再規劃適合的處理方向。')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROCESS SECTION ===== */}
      <section id="process" className="section process">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">
              {getContentField('process', 'tag', '服務流程')}
            </p>
            <h2 className="section-title">
              {getContentField('process', 'title', '從需求確認開始，逐步釐清問題')}
            </h2>
          </div>
          <div className="process-grid">
            <div className="process-step">
              <span className="step-number">01</span>
              <h3>{getContentField('process', 'step1Title', '初步諮詢')}</h3>
              <p>{getContentField('process', 'step1Desc', '了解目前遇到的狀況、疑問與希望確認的資訊。')}</p>
            </div>
            <div className="process-step">
              <span className="step-number">02</span>
              <h3>{getContentField('process', 'step2Title', '需求評估')}</h3>
              <p>{getContentField('process', 'step2Desc', '評估案件方向、資訊條件與可採取的合法處理方式。')}</p>
            </div>
            <div className="process-step">
              <span className="step-number">03</span>
              <h3>{getContentField('process', 'step3Title', '確認服務內容')}</h3>
              <p>{getContentField('process', 'step3Desc', '說明預計進行的工作項目、範圍與注意事項。')}</p>
            </div>
            <div className="process-step">
              <span className="step-number">04</span>
              <h3>{getContentField('process', 'step4Title', '資訊整理與分析')}</h3>
              <p>{getContentField('process', 'step4Desc', '依照確認方向進行資訊蒐集、查核與內容整理。')}</p>
            </div>
            <div className="process-step">
              <span className="step-number">05</span>
              <h3>{getContentField('process', 'step5Title', '結果說明')}</h3>
              <p>{getContentField('process', 'step5Desc', '說明已整理的資訊與可供後續判斷的重點。')}</p>
            </div>
          </div>
          <p className="process-note">
            {getContentField('process', 'note', '每項委託的情況、可取得資訊與處理方式皆不同，實際服務內容需經初步評估後確認。')}
          </p>
        </div>
      </section>

      {/* ===== NEWS SECTION ===== */}
      <section id="news" className="section live-news">
        <div className="container">
          <div className="section-header news-section-header">
            <p className="section-tag">
              {getContentField('news', 'tag', '即時新聞')}
            </p>
            <h2 className="section-title">
              {getContentField('news', 'title', '最新新聞與市場資訊')}
            </h2>
            <p className="section-desc">
              {getContentField('news', 'desc', '即時掌握產經、房產與財經相關消息')}
            </p>
          </div>

          {newsLoading ? (
            <p className="news-status">新聞載入中...</p>
          ) : newsError ? (
            <p className="news-status news-error">{newsError}</p>
          ) : (
            <div className="rss-news-layout">
              <aside className="rss-news-sidebar">
                <div className="rss-sidebar-heading">
                  <span>{getContentField('news', 'sidebarTitle', '分類')}</span>
                  <span aria-hidden="true">↻</span>
                </div>

                <div className="rss-category-list">
                  {newsCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`rss-category-button ${
                        selectedNewsCategory === category ? 'active' : ''
                      }`}
                      onClick={() => setSelectedNewsCategory(category)}
                    >
                      <span>{category}</span>
                      <span>{categoryCount(category)}</span>
                    </button>
                  ))}
                </div>
              </aside>

              <div className="rss-news-main">
                <div className="rss-news-toolbar">
                  <p>
                    共 <strong>{categoryNews.length}</strong> 篇文章
                  </p>
                  <span className="rss-latest-pill">◷ 最新</span>
                </div>

                {filteredNews.length === 0 ? (
                  <p className="news-status">此分類目前沒有新聞。</p>
                ) : (
                  <>
                    <div className="rss-news-grid">
                      {filteredNews.map((item) => (
                        <article className="rss-news-card" key={item.slug}>
                          <a
                            className="rss-news-image"
                            href={`/news/${encodeURIComponent(item.slug)}`}
                            aria-label={item.title}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                loading="lazy"
                              />
                            ) : (
                              <div className="rss-news-image-placeholder">
                                <span>{item.category || '即時新聞'}</span>
                              </div>
                            )}
                          </a>

                          <div className="rss-news-card-body">
                            <div className="rss-news-meta">
                              {item.category && (
                                <span className="rss-category-badge">
                                  {item.category}
                                </span>
                              )}
                              <span>•</span>
                              <span>
                                {item.date
                                  ? new Date(item.date).toLocaleDateString('zh-TW')
                                  : ''}
                              </span>
                            </div>

                            <h3>
                              <a href={`/news/${encodeURIComponent(item.slug)}`}>
                                {item.title}
                              </a>
                            </h3>

                            {item.description && (
                              <p className="rss-news-description">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>

                    {visibleNewsCount < categoryNews.length && (
                      <div className="news-load-more-wrap">
                        <button
                          type="button"
                          className="news-load-more-btn"
                          onClick={() =>
                            setVisibleNewsCount((prev) => prev + 12)
                          }
                        >
                          {getContentField('news', 'loadMoreText', '載入更多')}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== KNOWLEDGE SECTION ===== */}
      <section id="knowledge" className="section knowledge">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">
              {getContentField('knowledge', 'tag', '徵信知識')}
            </p>
            <h2 className="section-title">
              {getContentField('knowledge', 'title', '先了解，再決定下一步')}
            </h2>
            <p className="section-desc">
              {getContentField('knowledge', 'desc', '透過基礎徵信、蒐證與商業風險知識，協助您在尋求服務前建立正確觀念。')}
            </p>
          </div>
          <div className="knowledge-grid">
            <div className="knowledge-card">
              <h3>{getContentField('knowledge', 'card1Title', '徵信服務是否合法？')}</h3>
              <p>{getContentField('knowledge', 'card1Desc', '徵信服務本身並不代表可以使用任何方式取得資訊，實際調查仍應遵守相關法律規範。')}</p>
            </div>
            <div className="knowledge-card">
              <h3>{getContentField('knowledge', 'card2Title', '外遇調查需要注意哪些法律問題？')}</h3>
              <p>{getContentField('knowledge', 'card2Desc', '蒐集資訊時應注意隱私權、個人資料及相關法律界線，並非所有方式都能合法使用。')}</p>
            </div>
            <div className="knowledge-card">
              <h3>{getContentField('knowledge', 'card3Title', '商業合作前為什麼需要背景調查？')}</h3>
              <p>{getContentField('knowledge', 'card3Desc', '合作前查核有助了解對方背景與潛在風險，降低資訊不對稱造成的合作損失。')}</p>
            </div>
            <div className="knowledge-card">
              <h3>{getContentField('knowledge', 'card4Title', '企業如何降低合作風險？')}</h3>
              <p>{getContentField('knowledge', 'card4Desc', '除了契約審查，也應重視合作對象背景、履約能力與過往爭議資訊。')}</p>
            </div>
          </div>
          <div className="knowledge-cta">
            <a href="#contact" className="btn-outline">
              {getContentField('knowledge', 'ctaText', '查看更多徵信知識 →')}
            </a>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section id="faq" className="section faq">
        <div className="container faq-container">
          <div className="section-header">
            <p className="section-tag">
              {getContentField('faq', 'tag', '常見問題')}
            </p>
            <h2 className="section-title">
              {getContentField('faq', 'title', '諮詢前，先了解常見疑問')}
            </h2>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <h4>{getContentField('faq', 'q1', '找徵信社是否合法？')}</h4>
              <p>{getContentField('faq', 'a1', '徵信社本身是合法的行業，但必須遵守相關法律規定，不得使用非法手段獲取資訊。')}</p>
            </div>
            <div className="faq-item">
              <h4>{getContentField('faq', 'q2', '委託內容會不會外洩？')}</h4>
              <p>{getContentField('faq', 'a2', '瑞信徵信社高度重視保密，所有委託內容均嚴格保護，不會向第三方透露。')}</p>
            </div>
            <div className="faq-item">
              <h4>{getContentField('faq', 'q3', '可以保證一定查到結果嗎？')}</h4>
              <p>{getContentField('faq', 'a3', '調查結果取決於多種因素，我們會盡全力調查，但無法保證特定結果。')}</p>
            </div>
            <div className="faq-item">
              <h4>{getContentField('faq', 'q4', '諮詢時需要準備哪些資料？')}</h4>
              <p>{getContentField('faq', 'a4', '建議準備相關背景資訊、已知線索及您希望釐清的問題清單。')}</p>
            </div>
            <div className="faq-item">
              <h4>{getContentField('faq', 'q5', '企業也可以委託徵信服務嗎？')}</h4>
              <p>{getContentField('faq', 'a5', '是的，我們為企業提供商業調查和風險管理服務。')}</p>
            </div>
            <div className="faq-item">
              <h4>{getContentField('faq', 'q6', '費用如何計算？')}</h4>
              <p>{getContentField('faq', 'a6', '費用根據案件複雜程度、所需時間和資源而定，請聯繫我們進行評估。')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="cta-section">
        <div className="container cta-container">
          <span className="cta-line"></span>
          <h2>{getContentField('cta', 'title', '需要協助釐清資訊？')}</h2>
          <p>{getContentField('cta', 'desc', '面對不確定的關係、合作或企業風險，先了解問題與可行方向，再決定下一步。瑞信徵信社提供專業、客觀且重視保密的初步諮詢服務。')}</p>
          <a href="#contact" className="btn-gold">
            {getContentField('cta', 'btnText', '立即聯絡瑞信')}
          </a>
          <p className="cta-note">{getContentField('cta', 'note', '聯絡方式、電話、LINE 與服務時間待品牌資料確認後補充。')}</p>
        </div>
      </section>

      {/* ===== CONTACT SECTION ===== */}
      <section id="contact" className="section contact">
        <div className="container contact-container">
          <div className="section-header">
            <p className="section-tag">
              {getContentField('contact', 'tag', '聯絡諮詢')}
            </p>
            <h2 className="section-title">
              {getContentField('contact', 'title', '填寫初步諮詢需求')}
            </h2>
          </div>
          <div className="contact-form-wrapper">
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="name">{getContentField('contact', 'labelName', '姓名或稱呼')}</label>
                <input type="text" id="name" placeholder={getContentField('contact', 'placeholderName', '請輸入您的姓名')} required />
              </div>
              <div className="form-group">
                <label htmlFor="contact">{getContentField('contact', 'labelContact', '聯絡方式')}</label>
                <input type="text" id="contact" placeholder={getContentField('contact', 'placeholderContact', '電話或 Email')} required />
              </div>
              <div className="form-group">
                <label htmlFor="service">{getContentField('contact', 'labelService', '希望諮詢的服務')}</label>
                <select id="service" required>
                  <option value="">{getContentField('contact', 'placeholderService', '請選擇')}</option>
                  <option value="婚姻徵信">{getContentField('contact', 'optionMarriage', '婚姻徵信')}</option>
                  <option value="商業調查">{getContentField('contact', 'optionBusiness', '商業調查')}</option>
                  <option value="企業風險管理">{getContentField('contact', 'optionRisk', '企業風險管理')}</option>
                  <option value="其他需求">{getContentField('contact', 'optionOther', '其他需求')}</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">{getContentField('contact', 'labelMessage', '需求簡述')}</label>
                <textarea id="message" rows={5} placeholder={getContentField('contact', 'placeholderMessage', '請簡述您的需求...')}></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="time">{getContentField('contact', 'labelTime', '方便聯絡的時間')}</label>
                <input type="text" id="time" placeholder={getContentField('contact', 'placeholderTime', '例如：週一至週五 14:00-17:00')} />
              </div>
              <p className="form-note">
                {getContentField('contact', 'note', '請勿在尚未確認聯絡管道安全前，填寫過度敏感或可識別第三人的完整資料。')}
              </p>
              <button type="submit" className="btn-primary">
                {getContentField('contact', 'submitText', '送出諮詢需求')}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <p className="footer-logo">
              {getContentField('footer', 'logo', '瑞信徵信社')}
            </p>
            <p className="footer-desc">
              {getContentField('footer', 'desc', '提供婚姻徵信、商業調查與企業風險管理相關服務，協助個人與企業釐清資訊、降低風險。')}
            </p>
          </div>
          <nav className="footer-nav">
            {footerMenu.map((item) => (
              <a key={item.id} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <p className="footer-disclaimer">
            {getContentField('footer', 'disclaimer', '本網站內容為一般資訊與服務介紹，不構成法律意見。實際案件應依個別情況進行評估，必要時應諮詢專業律師。')}
          </p>
          <p className="footer-copy">
            {getContentField('footer', 'copyright', '© 2026 瑞信徵信社 All Rights Reserved.')}
          </p>
        </div>
      </footer>

      {/* ===== ADMIN ACCESS ===== */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 999 }}>
        <a
          href="/admin"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: '#1a2a3a',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '12px',
            opacity: 0.5,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
        >
          🔧 Admin
        </a>
      </div>
    </div>
  );
}

export default App;