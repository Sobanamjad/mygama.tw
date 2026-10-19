import { useState, useEffect } from 'react';
import { pageService } from '../../services/adminService';
import type { Page } from '../../services/adminService';

export function PageManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newPage, setNewPage] = useState({
    slug: '',
    title: '',
    description: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = () => {
    const loaded = pageService.getPages();
    setPages(loaded);
  };

  const handleCreatePage = () => {
    if (!newPage.slug || !newPage.title) return;
    
    pageService.createPage({
      slug: newPage.slug,
      title: newPage.title,
      description: newPage.description || '',
      content: newPage.content || '',
      metaTitle: newPage.metaTitle || '',
      metaDescription: newPage.metaDescription || '',
      isPublished: true
    });
    
    setNewPage({ slug: '', title: '', description: '', content: '', metaTitle: '', metaDescription: '' });
    loadPages();
    setIsEditing(false);
  };

  const handleTogglePublish = (id: string) => {
    pageService.togglePublish(id);
    loadPages();
  };

  const handleDeletePage = (id: string) => {
    if (window.confirm('確定要刪除此頁面嗎？')) {
      pageService.deletePage(id);
      loadPages();
    }
  };

  return (
    <div className="admin-page-manager">
      <h2>頁面管理</h2>
      
      <div className="admin-page-actions">
        <button onClick={() => setIsEditing(!isEditing)} className="admin-primary-btn">
          {isEditing ? '取消' : '新增頁面'}
        </button>
      </div>

      {isEditing && (
        <div className="admin-page-form">
          <h3>建立新頁面</h3>
          <div className="admin-form-group">
            <label>頁面路徑 (slug)</label>
            <input
              value={newPage.slug}
              onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
              placeholder="例如: services"
            />
            <small>網址將為: /{newPage.slug}</small>
          </div>
          <div className="admin-form-group">
            <label>頁面標題</label>
            <input
              value={newPage.title}
              onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
              placeholder="頁面標題"
            />
          </div>
          <div className="admin-form-group">
            <label>簡短描述</label>
            <textarea
              value={newPage.description}
              onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
              placeholder="頁面簡短描述"
              rows={2}
            />
          </div>
          <div className="admin-form-group">
            <label>頁面內容 (HTML)</label>
            <textarea
              value={newPage.content}
              onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
              placeholder="<h1>標題</h1><p>內容...</p>"
              rows={6}
            />
          </div>
          <button onClick={handleCreatePage} className="admin-save-btn">建立頁面</button>
        </div>
      )}

      <div className="admin-page-list">
        {pages.map(page => (
          <div key={page.id} className="admin-page-item">
            <div className="admin-page-info">
              <div className="admin-page-title">
                <strong>{page.title}</strong>
                <span className={`admin-page-status ${page.isPublished ? 'published' : 'draft'}`}>
                  {page.isPublished ? '已發佈' : '草稿'}
                </span>
              </div>
              <div className="admin-page-slug">/ {page.slug}</div>
              <div className="admin-page-meta">
                <span>更新: {new Date(page.updatedAt).toLocaleString('zh-TW')}</span>
              </div>
            </div>
            <div className="admin-page-actions">
              <button onClick={() => handleTogglePublish(page.id)}>
                {page.isPublished ? '下架' : '發佈'}
              </button>
              <button onClick={() => handleDeletePage(page.id)} className="admin-danger-btn">
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}