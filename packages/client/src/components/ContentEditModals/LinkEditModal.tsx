import React, { useState } from 'react';
import './ContentEditModals.css';

export interface LinkEditData {
  text: {
    ru: string;
    he: string;
  };
  url: string;
}

interface LinkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LinkEditData) => void;
  actionName: string;
}

export const LinkEditModal: React.FC<LinkEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  actionName,
}) => {
  const [text, setText] = useState({ ru: 'Рассчитать Ипотеку', he: 'חשב את המשכנתא שלך' });
  const [url, setUrl] = useState('https://www.bankim.online/');

  const handleSave = () => {
    onSave({ text, url });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content link-edit-modal">
        <div className="modal-header">
          <h3>Редактировать действие Ссылка: {actionName}</h3>
          <button onClick={onClose} className="modal-close-button">&times;</button>
        </div>
        <div className="modal-body">
          <div className="link-form">
            <div className="input-group">
              <label>RU</label>
              <input type="text" value={text.ru} onChange={(e) => setText({ ...text, ru: e.target.value })} />
            </div>
            <div className="input-group">
              <label>HEB</label>
              <input type="text" value={text.he} onChange={(e) => setText({ ...text, he: e.target.value })} dir="rtl" />
            </div>
            <div className="input-group">
              <label>URL</label>
              <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="button-secondary" onClick={onClose}>Назад</button>
          <button className="button-primary" onClick={handleSave}>Сохранить и опубликовать</button>
        </div>
      </div>
    </div>
  );
};

export default LinkEditModal; 