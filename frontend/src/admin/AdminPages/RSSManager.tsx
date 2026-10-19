import { useState, useEffect } from 'react';
import { rssService } from '../../services/adminService';
import type { RSSFeed } from '../../services/adminService';

export function RSSManager() {
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [newFeed, setNewFeed] = useState({ name: '', url: '', categories: '' });

  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = () => {
    const loaded = rssService.getFeeds();
    setFeeds(loaded);
  };

  const handleAddFeed = () => {
    if (!newFeed.name || !newFeed.url) return;
    
    const categories = newFeed.categories.split(',').map(c => c.trim());
    rssService.addFeed({
      name: newFeed.name,
      url: newFeed.url,
      categories: categories,
      isActive: true
    });
    
    setNewFeed({ name: '', url: '', categories: '' });
    loadFeeds();
  };

  const handleToggle = (id: string) => {
    rssService.toggleFeed(id);
    loadFeeds();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此 RSS 來源嗎？')) {
      rssService.deleteFeed(id);
      loadFeeds();
    }
  };

  return (
    <div className="admin-rss-manager">
      <h2>RSS 來源管理</h2>
      
      <div className="admin-add-rss">
        <h3>新增 RSS 來源</h3>
        <div className="admin-rss-form">
          <input
            value={newFeed.name}
            onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
            placeholder="名稱 (例如: 中華超傳媒)"
          />
          <input
            value={newFeed.url}
            onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
            placeholder="RSS URL"
          />
          <input
            value={newFeed.categories}
            onChange={(e) => setNewFeed({ ...newFeed, categories: e.target.value })}
            placeholder="分類 (以逗號分隔)"
          />
          <button onClick={handleAddFeed}>新增 RSS</button>
        </div>
      </div>

      <div className="admin-rss-list">
        <h3>RSS 來源列表</h3>
        {feeds.map(feed => (
          <div key={feed.id} className="admin-rss-item">
            <div className="admin-rss-info">
              <div className="admin-rss-name">
                <strong>{feed.name}</strong>
                <span className={`admin-rss-status ${feed.isActive ? 'active' : 'inactive'}`}>
                  {feed.isActive ? '啟用' : '停用'}
                </span>
              </div>
              <div className="admin-rss-url">{feed.url}</div>
              <div className="admin-rss-categories">
                {feed.categories.map(cat => (
                  <span key={cat} className="admin-rss-tag">{cat}</span>
                ))}
              </div>
            </div>
            <div className="admin-rss-actions">
              <button onClick={() => handleToggle(feed.id)} className="admin-toggle-btn">
                {feed.isActive ? '停用' : '啟用'}
              </button>
              <button onClick={() => handleDelete(feed.id)} className="admin-danger-btn">
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}