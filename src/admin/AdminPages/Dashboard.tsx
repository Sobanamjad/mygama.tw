import { useState, useEffect } from 'react';
import { menuService, contentService, rssService, pageService, mediaService } from '../../services/adminService';

export function Dashboard() {
  const [stats, setStats] = useState({
    menus: 0,
    contentSections: 0,
    rssFeeds: 0,
    pages: 0,
    media: 0,
  });

  useEffect(() => {
    const menus = menuService.getMenus();
    const content = contentService.getContent();
    const feeds = rssService.getFeeds();
    const pages = pageService.getPages();
    const media = mediaService.getMedia();

    setStats({
      menus: menus.length,
      contentSections: content.length,
      rssFeeds: feeds.length,
      pages: pages.filter(p => p.isPublished).length,
      media: media.length,
    });
  }, []);

  return (
    <div className="admin-dashboard-stats">
      <h2>網站概覽</h2>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats.menus}</div>
          <div className="admin-stat-label">選單</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats.contentSections}</div>
          <div className="admin-stat-label">內容區塊</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats.rssFeeds}</div>
          <div className="admin-stat-label">RSS 來源</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats.pages}</div>
          <div className="admin-stat-label">已發佈頁面</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{stats.media}</div>
          <div className="admin-stat-label">媒體檔案</div>
        </div>
      </div>
      
      <div className="admin-quick-actions">
        <h3>快速操作</h3>
        <div className="admin-actions-grid">
          <a href="#admin" onClick={(e) => {
            e.preventDefault();
            (document.querySelector('[data-tab="menus"]') as HTMLElement)?.click();
          }}>管理選單</a>
          <a href="#admin" onClick={(e) => {
            e.preventDefault();
            (document.querySelector('[data-tab="content"]') as HTMLElement)?.click();
          }}>編輯內容</a>
          <a href="#admin" onClick={(e) => {
            e.preventDefault();
            (document.querySelector('[data-tab="rss"]') as HTMLElement)?.click();
          }}>新增 RSS</a>
          <a href="#admin" onClick={(e) => {
            e.preventDefault();
            (document.querySelector('[data-tab="pages"]') as HTMLElement)?.click();
          }}>建立頁面</a>
        </div>
      </div>
    </div>
  );
}