import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Dashboard } from './AdminPages/Dashboard';
import { MenuManager } from './AdminPages/MenuManager';
import { ContentManager } from './AdminPages/ContentManager';
import { MediaManager } from './AdminPages/MediaManager';
import { RSSManager } from './AdminPages/RSSManager';
import { PageManager } from './AdminPages/PageManager';
import './admin.css';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'menus':
        return <MenuManager />;
      case 'content':
        return <ContentManager />;
      case 'media':
        return <MediaManager />;
      case 'rss':
        return <RSSManager />;
      case 'pages':
        return <PageManager />;
      default:
        return <div>頁面建置中...</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="admin-main">
        <div className="admin-main-header">
          <h1>管理控制台</h1>
        </div>
        <div className="admin-main-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}