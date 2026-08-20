import { useState, useEffect } from 'react';
import { menuService } from '../../services/adminService';
import type { MenuItem, Menu } from '../../services/adminService';

export function MenuManager() {
  const [menuType, setMenuType] = useState<'header' | 'footer'>('header');
  const [menu, setMenu] = useState<Menu | undefined>(undefined);
  const [newItem, setNewItem] = useState({ label: '', href: '' });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadedMenu = menuService.getMenu(menuType);
    if (loadedMenu) {
      setMenu(loadedMenu);
    }
  }, [menuType]);

  const handleAddItem = () => {
    if (!newItem.label || !newItem.href) return;
    
    const item: MenuItem = {
      id: Date.now().toString(),
      label: newItem.label,
      href: newItem.href,
      order: menu?.items.length || 0,
      children: []
    };

    if (menu) {
      const updatedItems = [...menu.items, item];
      menuService.updateMenu(menuType, updatedItems);
      setMenu({ ...menu, items: updatedItems });
      setNewItem({ label: '', href: '' });
    }
  };

  const handleDeleteItem = (id: string) => {
    if (!menu) return;
    const updatedItems = menu.items.filter(item => item.id !== id);
    menuService.updateMenu(menuType, updatedItems);
    setMenu({ ...menu, items: updatedItems });
  };

  const handleMoveItem = (id: string, direction: 'up' | 'down') => {
    if (!menu) return;
    const index = menu.items.findIndex(item => item.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= menu.items.length) return;

    const items = [...menu.items];
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    
    menuService.updateMenu(menuType, items);
    setMenu({ ...menu, items });
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!menu || !editingItem) return;
    
    const updatedItems = menu.items.map(item => 
      item.id === editingItem.id ? editingItem : item
    );
    
    menuService.updateMenu(menuType, updatedItems);
    setMenu({ ...menu, items: updatedItems });
    setIsEditing(false);
    setEditingItem(null);
  };

  return (
    <div className="admin-menu-manager">
      <h2>選單管理</h2>
      
      <div className="admin-tabs">
        <button 
          className={menuType === 'header' ? 'active' : ''}
          onClick={() => setMenuType('header')}
        >
          Header 選單
        </button>
        <button 
          className={menuType === 'footer' ? 'active' : ''}
          onClick={() => setMenuType('footer')}
        >
          Footer 選單
        </button>
      </div>

      <div className="admin-menu-items">
        {menu?.items.map((item, index) => (
          <div key={item.id} className="admin-menu-item">
            <span>{item.label}</span>
            <span className="admin-menu-href">{item.href}</span>
            <div className="admin-menu-actions">
              <button onClick={() => handleMoveItem(item.id, 'up')} disabled={index === 0}>
                ↑
              </button>
              <button onClick={() => handleMoveItem(item.id, 'down')} disabled={index === menu.items.length - 1}>
                ↓
              </button>
              <button onClick={() => handleEditItem(item)}>編輯</button>
              <button onClick={() => handleDeleteItem(item.id)}>刪除</button>
            </div>
          </div>
        ))}
      </div>

      {isEditing && editingItem && (
        <div className="admin-edit-modal">
          <div className="admin-edit-modal-content">
            <h3>編輯選單項目</h3>
            <div className="admin-form-group">
              <label>名稱</label>
              <input 
                value={editingItem.label}
                onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label>連結</label>
              <input 
                value={editingItem.href}
                onChange={(e) => setEditingItem({ ...editingItem, href: e.target.value })}
              />
            </div>
            <div className="admin-modal-actions">
              <button onClick={handleSaveEdit}>儲存</button>
              <button onClick={() => { setIsEditing(false); setEditingItem(null); }}>取消</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-add-item">
        <h3>新增選單項目</h3>
        <div className="admin-add-form">
          <input 
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            placeholder="名稱 (例如: 服務項目)"
          />
          <input 
            value={newItem.href}
            onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
            placeholder="連結 (例如: /#services)"
          />
          <button onClick={handleAddItem}>新增</button>
        </div>
      </div>

      <div className="admin-menu-preview">
        <h3>即時預覽</h3>
        <div className="admin-preview-nav">
          {menu?.items.map(item => (
            <a key={item.id} href={item.href} className="admin-preview-link">
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}