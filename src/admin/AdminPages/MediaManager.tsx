import { useState, useEffect, useRef } from 'react';
import { mediaService } from '../../services/adminService';
import type { MediaItem } from '../../services/adminService';

export function MediaManager() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = () => {
    const loaded = mediaService.getMedia();
    setMedia(loaded);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await mediaService.addMedia(file);
      loadMedia();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上傳失敗，請稍後再試');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此檔案嗎？')) {
      mediaService.deleteMedia(id);
      loadMedia();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="admin-media-manager">
      <h2>媒體管理</h2>
      
      <div className="admin-media-upload">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*,video/*,.pdf,.doc,.docx"
          disabled={uploading}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="admin-primary-btn"
        >
          {uploading ? '上傳中...' : '上傳檔案'}
        </button>
      </div>

      <div className="admin-media-grid">
        {media.map(item => (
          <div key={item.id} className="admin-media-item">
            {item.type === 'image' ? (
              <img src={item.url} alt={item.name} />
            ) : (
              <div className="admin-media-icon">
                {item.name.split('.').pop()?.toUpperCase()}
              </div>
            )}
            <div className="admin-media-info">
              <div className="admin-media-name">{item.name}</div>
              <div className="admin-media-size">{formatSize(item.size)}</div>
            </div>
            <button onClick={() => handleDelete(item.id)} className="admin-danger-btn">
              刪除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}