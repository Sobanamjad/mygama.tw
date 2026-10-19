import './admin.css';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: '儀表板' },
  { id: 'menus', label: '選單管理' },
  { id: 'content', label: '內容管理' },
  { id: 'media', label: '媒體管理' },
  { id: 'rss', label: 'RSS 管理' },
  { id: 'pages', label: '頁面管理' },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>管理系統</h2>
      </div>
      <nav className="admin-sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`admin-sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <button 
          className="admin-sidebar-logout"
          onClick={() => {
            localStorage.removeItem('ruixin_admin');
            window.location.reload();
          }}
        >
          登出
        </button>
      </div>
    </aside>
  );
}