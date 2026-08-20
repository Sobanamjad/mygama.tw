import { useState, useEffect } from 'react';
import { contentService } from '../../services/adminService';
import type { ContentSection } from '../../services/adminService';

export function ContentManager() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});

  useEffect(() => {
    const loaded = contentService.getContent();
    setSections(loaded);
    if (loaded.length > 0 && !selectedSection) {
      setSelectedSection(loaded[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedSection) {
      const section = sections.find(s => s.id === selectedSection);
      if (section) {
        setEditedContent(section.content);
      }
    }
  }, [selectedSection, sections]);

  const handleSave = () => {
    if (selectedSection) {
      contentService.updateSection(selectedSection, editedContent);
      // Refresh
      const loaded = contentService.getContent();
      setSections(loaded);
      alert('內容已儲存！');
    }
  };

  const selected = sections.find(s => s.id === selectedSection);

  return (
    <div className="admin-content-manager">
      <h2>內容管理</h2>
      
      <div className="admin-content-layout">
        <div className="admin-content-sidebar">
          <h3>頁面區塊</h3>
          {sections.map(section => (
            <button
              key={section.id}
              className={`admin-content-section-btn ${selectedSection === section.id ? 'active' : ''}`}
              onClick={() => setSelectedSection(section.id)}
            >
              {section.title || section.id}
            </button>
          ))}
        </div>

        <div className="admin-content-editor">
          {selected && (
            <>
              <h3>編輯: {selected.title}</h3>
              <p className="admin-last-updated">最後更新: {new Date(selected.updatedAt).toLocaleString('zh-TW')}</p>
              
              {Object.entries(selected.content).map(([key, value]) => (
                <div key={key} className="admin-form-group">
                  <label>{key}</label>
                  {value.length > 100 ? (
                    <textarea
                      value={editedContent[key] || ''}
                      onChange={(e) => setEditedContent({ ...editedContent, [key]: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <input
                      value={editedContent[key] || ''}
                      onChange={(e) => setEditedContent({ ...editedContent, [key]: e.target.value })}
                    />
                  )}
                </div>
              ))}

              <button className="admin-save-btn" onClick={handleSave}>
                儲存變更
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}